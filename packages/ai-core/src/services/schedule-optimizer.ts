/**
 * 调度优化服务
 * 核心功能：优化任务调度，生成可执行的日程安排
 */

import {
  SchedulingInput,
  SchedulingOutput,
  ScheduledTask,
  DailySchedule,
  Task,
  UserPreference,
  createSchedulingPromptConfig,
  validateSchedulingOutput,
  checkScheduleConstraints,
} from '../prompt-engineering/scheduling';
import {
  generateStructuredResponse,
  selectModelForTask,
} from '../models/openai-client';
import { Plan, PlanTask } from './plan-generator';

// ==================== 类型定义 ====================

export interface OptimizedSchedule {
  id: string;
  planId: string;
  createdAt: string;
  days: DailySchedule[];
  unscheduledTasks: Array<{
    task: Task;
    reason: string;
  }>;
  statistics: {
    totalTasks: number;
    scheduledTasks: number;
    totalDays: number;
    totalWorkHours: number;
    averageDailyHours: number;
    completionRate: number;
  };
  warnings: string[];
  suggestions: string[];
}

export interface ScheduleConstraints {
  startDate: Date;
  deadline: Date;
  workingHours: {
    start: string; // "HH:mm"
    end: string;
  };
  workingDays: number[]; // 0=周日, 1=周一...
  maxHoursPerDay: number;
  breakDurationMinutes: number;
  fixedAppointments?: Array<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface OptimizationOptions {
  strategy?: 'minimizeTotalTime' | 'balanceWorkload' | 'maximizeProductivity';
  respectCategoryBatching?: boolean; // 是否将同类任务安排在一起
  preserveFocusBlocks?: boolean; // 是否保留专注时间块
  maxRetries?: number;
}

export interface ScheduleAdjustment {
  type: 'move' | 'swap' | 'split' | 'combine';
  description: string;
  affectedTasks: string[];
  originalSchedule?: DailySchedule[];
  newSchedule?: DailySchedule[];
}

// ==================== 错误类 ====================

export class ScheduleOptimizationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly recoverable: boolean = false
  ) {
    super(message);
    this.name = 'ScheduleOptimizationError';
  }
}

// ==================== 核心服务 ====================

/**
 * 生成唯一ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 将 PlanTask 转换为 Task
 */
function convertPlanTasksToTasks(planTasks: PlanTask[]): Task[] {
  return planTasks.map((pt) => ({
    id: pt.id,
    title: pt.title,
    estimatedHours: pt.timeEstimation?.realistic || pt.estimatedHours,
    priority: pt.priority,
    dependencies: pt.dependencies,
    category: pt.category,
  }));
}

/**
 * 构建 SchedulingInput
 */
function buildSchedulingInput(
  tasks: Task[],
  constraints: ScheduleConstraints,
  options: OptimizationOptions
): SchedulingInput {
  // 转换固定预约格式
  const fixedAppointments = constraints.fixedAppointments?.map((apt) => ({
    title: apt.title,
    startTime: `${apt.date}T${apt.startTime}:00`,
    endTime: `${apt.date}T${apt.endTime}:00`,
  }));

  return {
    tasks,
    userPreferences: {
      preferredWorkHours: constraints.workingHours,
      maxHoursPerDay: constraints.maxHoursPerDay,
      preferredWorkDays: constraints.workingDays,
      breakDuration: constraints.breakDurationMinutes,
    },
    constraints: {
      fixedAppointments,
    },
    optimizationTarget: options.strategy || 'balanceWorkload',
  };
}

/**
 * 执行调度优化
 */
async function executeScheduling(
  input: SchedulingInput,
  maxRetries: number = 3
): Promise<SchedulingOutput> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = createSchedulingPromptConfig(input);
      const response = await generateStructuredResponse<SchedulingOutput>({
        ...config,
        model: selectModelForTask('scheduling'),
      });

      if (!validateSchedulingOutput(response, input.tasks)) {
        throw new ScheduleOptimizationError('Invalid scheduling output format', null, true);
      }

      // 验证约束条件
      const constraintChecks = checkScheduleConstraints(response.schedule, input);
      const violations = constraintChecks.filter((c) => c.violated);

      if (violations.length > 0) {
        console.warn('Schedule constraint violations:', violations);
        // 如果是可恢复的错误，尝试重试
        if (attempt < maxRetries) {
          continue;
        }
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new ScheduleOptimizationError(
    `Schedule optimization failed after ${maxRetries} attempts`,
    lastError,
    false
  );
}

/**
 * 主函数：从计划生成优化日程
 */
export async function optimizeScheduleFromPlan(
  plan: Plan,
  constraints: ScheduleConstraints,
  options: OptimizationOptions = {}
): Promise<OptimizedSchedule> {
  const tasks = convertPlanTasksToTasks(plan.tasks);
  const input = buildSchedulingInput(tasks, constraints, options);

  const schedulingOutput = await executeScheduling(input, options.maxRetries);

  // 识别未调度的任务
  const scheduledIds = new Set<string>();
  for (const day of schedulingOutput.schedule) {
    for (const task of day.tasks) {
      scheduledIds.add(task.id);
    }
  }

  const unscheduledTasks = tasks
    .filter((t) => !scheduledIds.has(t.id))
    .map((t) => ({
      task: t,
      reason: '超出时间限制或无法满足依赖关系',
    }));

  // 生成警告
  const warnings: string[] = [];
  if (unscheduledTasks.length > 0) {
    warnings.push(`${unscheduledTasks.length} 个任务无法在截止日期前安排`);
  }

  // 计算统计信息
  const totalTasks = tasks.length;
  const scheduledTasks = scheduledIds.size;

  const schedule: OptimizedSchedule = {
    id: generateId('schedule'),
    planId: plan.id,
    createdAt: new Date().toISOString(),
    days: schedulingOutput.schedule,
    unscheduledTasks,
    statistics: {
      totalTasks,
      scheduledTasks,
      totalDays: schedulingOutput.metrics.totalDays,
      totalWorkHours: schedulingOutput.metrics.totalWorkHours,
      averageDailyHours: schedulingOutput.metrics.averageDailyHours,
      completionRate: Math.round((scheduledTasks / totalTasks) * 100),
    },
    warnings,
    suggestions: schedulingOutput.suggestions || [],
  };

  return schedule;
}

/**
 * 流式调度优化
 */
export async function* optimizeScheduleStream(
  plan: Plan,
  constraints: ScheduleConstraints,
  options: OptimizationOptions = {}
): AsyncGenerator<
  | { type: 'analyzing'; message: string }
  | { type: 'optimizing'; progress: number }
  | { type: 'complete'; data: OptimizedSchedule }
  | { type: 'error'; message: string }
> {
  try {
    yield { type: 'analyzing', message: '分析任务依赖关系和约束条件...' };

    const tasks = convertPlanTasksToTasks(plan.tasks);
    yield { type: 'optimizing', progress: 20 };

    const input = buildSchedulingInput(tasks, constraints, options);
    yield { type: 'optimizing', progress: 40 };

    const schedulingOutput = await executeScheduling(input, options.maxRetries);
    yield { type: 'optimizing', progress: 80 };

    const schedule = await optimizeScheduleFromPlan(plan, constraints, options);
    yield { type: 'complete', data: schedule };
  } catch (error) {
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : 'Schedule optimization failed',
    };
  }
}

/**
 * 调整日程
 */
export function adjustSchedule(
  schedule: OptimizedSchedule,
  adjustment: ScheduleAdjustment
): OptimizedSchedule {
  const newSchedule = { ...schedule };

  switch (adjustment.type) {
    case 'move':
      // 移动任务到不同日期
      // 实现逻辑...
      break;
    case 'swap':
      // 交换两个任务的日期
      // 实现逻辑...
      break;
    case 'split':
      // 将任务拆分为多个小任务
      // 实现逻辑...
      break;
    case 'combine':
      // 合并相关任务
      // 实现逻辑...
      break;
  }

  return newSchedule;
}

/**
 * 重新平衡工作负载
 */
export function rebalanceWorkload(
  schedule: OptimizedSchedule,
  targetHoursPerDay: number
): OptimizedSchedule {
  const newDays: DailySchedule[] = [];
  const pendingTasks: ScheduledTask[] = [];

  // 收集所有任务
  for (const day of schedule.days) {
    pendingTasks.push(...day.tasks);
  }

  // 按优先级和依赖排序
  pendingTasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // 重新分配到各天
  let currentDate = new Date(schedule.days[0]?.date || new Date());
  let currentDayTasks: ScheduledTask[] = [];
  let currentDayHours = 0;

  for (const task of pendingTasks) {
    const taskHours = task.estimatedHours;

    if (currentDayHours + taskHours > targetHoursPerDay && currentDayTasks.length > 0) {
      // 保存当前天
      newDays.push({
        date: currentDate.toISOString().split('T')[0],
        tasks: [...currentDayTasks],
        totalHours: currentDayHours,
        focusBlocksUsed: Math.ceil(currentDayHours / 2),
      });

      // 开始新的一天
      currentDate.setDate(currentDate.getDate() + 1);
      currentDayTasks = [];
      currentDayHours = 0;
    }

    currentDayTasks.push(task);
    currentDayHours += taskHours;
  }

  // 添加最后一天
  if (currentDayTasks.length > 0) {
    newDays.push({
      date: currentDate.toISOString().split('T')[0],
      tasks: currentDayTasks,
      totalHours: currentDayHours,
      focusBlocksUsed: Math.ceil(currentDayHours / 2),
    });
  }

  return {
    ...schedule,
    days: newDays,
    statistics: {
      ...schedule.statistics,
      totalDays: newDays.length,
      averageDailyHours:
        newDays.reduce((sum, d) => sum + d.totalHours, 0) / newDays.length,
    },
  };
}

/**
 * 检查日程冲突
 */
export function detectScheduleConflicts(schedule: OptimizedSchedule): Array<{
  type: 'overlap' | 'dependency' | 'deadline';
  task1: string;
  task2?: string;
  description: string;
}> {
  const conflicts: Array<{
    type: 'overlap' | 'dependency' | 'deadline';
    task1: string;
    task2?: string;
    description: string;
  }> = [];

  const taskMap = new Map<string, ScheduledTask & { date: string }>();

  // 构建任务映射
  for (const day of schedule.days) {
    for (const task of day.tasks) {
      taskMap.set(task.id, { ...task, date: day.date });
    }
  }

  // 检查依赖冲突
  for (const [id, task] of taskMap) {
    for (const depId of task.dependencies) {
      const depTask = taskMap.get(depId);
      if (depTask) {
        const taskStart = new Date(task.scheduledStart);
        const depEnd = new Date(depTask.scheduledEnd);

        if (taskStart < depEnd) {
          conflicts.push({
            type: 'dependency',
            task1: id,
            task2: depId,
            description: `任务 "${task.title}" 在依赖 "${depTask.title}" 完成前开始`,
          });
        }
      }
    }
  }

  // 检查时间重叠
  for (const day of schedule.days) {
    const dayTasks = [...day.tasks].sort(
      (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
    );

    for (let i = 0; i < dayTasks.length - 1; i++) {
      const current = dayTasks[i];
      const next = dayTasks[i + 1];

      const currentEnd = new Date(current.scheduledEnd);
      const nextStart = new Date(next.scheduledStart);

      if (currentEnd > nextStart) {
        conflicts.push({
          type: 'overlap',
          task1: current.id,
          task2: next.id,
          description: `任务 "${current.title}" 和 "${next.title}" 时间重叠`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * 导出为日历格式（iCalendar）
 */
export function exportToICalendar(schedule: OptimizedSchedule): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanRea//AI Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const day of schedule.days) {
    for (const task of day.tasks) {
      const uid = `${task.id}@planrea.ai`;
      const dtstart = new Date(task.scheduledStart).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtend = new Date(task.scheduledEnd).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTART:${dtstart}`);
      lines.push(`DTEND:${dtend}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`SUMMARY:${task.title}`);
      lines.push(`DESCRIPTION:优先级: ${task.priority}\\n类别: ${task.category}`);
      lines.push(`CATEGORIES:${task.category}`);
      lines.push('END:VEVENT');
    }
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * 导出为 JSON 格式
 */
export function exportToJSON(schedule: OptimizedSchedule): string {
  return JSON.stringify(schedule, null, 2);
}

// ==================== 导出 ====================

export {
  SchedulingInput,
  SchedulingOutput,
  ScheduledTask,
  DailySchedule,
  Task,
  UserPreference,
};
