/**
 * 计划生成服务
 * 核心功能：将用户目标转换为结构化计划
 */

import {
  TaskBreakdownInput,
  TaskBreakdownOutput,
  TaskOutput,
  createTaskBreakdownPromptConfig,
  validateTaskBreakdownOutput,
} from '../prompt-engineering/task-breakdown';
import {
  TimeEstimationInput,
  TimeEstimationOutput,
  createTimeEstimationPromptConfig,
  validateTimeEstimationOutput,
} from '../prompt-engineering/time-estimation';
import {
  generateStructuredResponse,
  generateOpenAIResponse,
  selectModelForTask,
} from '../models/openai-client';

// ==================== 类型定义 ====================

export interface GoalInput {
  title: string;
  description?: string;
  deadline: Date;
  availableHoursPerDay: number;
  workingDaysPerWeek?: number; // 默认 5
  startDate?: Date; // 默认今天
}

export interface PlanTask extends TaskOutput {
  timeEstimation?: TimeEstimationOutput;
  order: number;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  tasks: PlanTask[];
  metadata: {
    createdAt: string;
    deadline: string;
    totalEstimatedHours: number;
    workingDays: number;
    dailyAverageHours: number;
  };
  summary: string;
}

export interface PlanGenerationOptions {
  includeTimeEstimation?: boolean; // 是否包含详细时间估算
  estimateEachTask?: boolean; // 是否为每个任务单独估算时间
  maxRetries?: number;
}

// ==================== 错误类 ====================

export class PlanGenerationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly stage?: 'breakdown' | 'estimation' | 'validation'
  ) {
    super(message);
    this.name = 'PlanGenerationError';
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
 * 计算总可用小时数
 */
function calculateTotalAvailableHours(input: GoalInput): number {
  const startDate = input.startDate || new Date();
  const endDate = input.deadline;
  const workingDaysPerWeek = input.workingDaysPerWeek || 5;

  // 计算工作日天数
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // 粗略计算工作日（简化版）
  const workingDays = totalWeeks * workingDaysPerWeek + Math.min(remainingDays, workingDaysPerWeek);

  return workingDays * input.availableHoursPerDay;
}

/**
 * 执行任务分解
 */
async function executeTaskBreakdown(
  input: TaskBreakdownInput,
  maxRetries: number = 3
): Promise<TaskBreakdownOutput> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = createTaskBreakdownPromptConfig(input);
      const response = await generateStructuredResponse<TaskBreakdownOutput>({
        ...config,
        responseFormat: { type: 'json_object' },
        model: selectModelForTask('breakdown'),
      });

      if (!validateTaskBreakdownOutput(response)) {
        throw new PlanGenerationError(
          'Invalid task breakdown output format',
          null,
          'validation'
        );
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        // 指数退避重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new PlanGenerationError(
    `Task breakdown failed after ${maxRetries} attempts`,
    lastError,
    'breakdown'
  );
}

/**
 * 执行单个任务的时间估算
 */
async function estimateTaskTime(
  task: TaskOutput,
  userSkillLevel: 'beginner' | 'intermediate' | 'expert' = 'intermediate'
): Promise<TimeEstimationOutput> {
  const input: TimeEstimationInput = {
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
    },
    context: {
      userSkillLevel,
      complexity: task.estimatedHours > 4 ? 'complex' : task.estimatedHours > 2 ? 'moderate' : 'simple',
    },
  };

  const config = createTimeEstimationPromptConfig(input);
  const response = await generateStructuredResponse<TimeEstimationOutput>({
    ...config,
    responseFormat: { type: 'json_object' },
    model: selectModelForTask('estimation'),
  });

  if (!validateTimeEstimationOutput(response)) {
    throw new PlanGenerationError(
      `Invalid time estimation output for task ${task.id}`,
      null,
      'validation'
    );
  }

  return response;
}

/**
 * 批量估算任务时间
 */
async function estimateTasksTime(
  tasks: TaskOutput[],
  options?: { userSkillLevel?: 'beginner' | 'intermediate' | 'expert' }
): Promise<Map<string, TimeEstimationOutput>> {
  const results = new Map<string, TimeEstimationOutput>();

  // 串行处理以避免速率限制
  for (const task of tasks) {
    try {
      const estimation = await estimateTaskTime(task, options?.userSkillLevel);
      results.set(task.id, estimation);
    } catch (error) {
      console.warn(`Failed to estimate time for task ${task.id}:`, error);
      // 使用原始估算作为回退
      results.set(task.id, {
        optimistic: task.estimatedHours * 0.8,
        realistic: task.estimatedHours,
        pessimistic: task.estimatedHours * 1.3,
        confidence: 0.5,
        breakdown: {
          coreWork: task.estimatedHours * 0.7,
          research: task.estimatedHours * 0.15,
          review: task.estimatedHours * 0.1,
          buffer: task.estimatedHours * 0.05,
        },
        assumptions: ['使用原始估算作为基础'],
        risks: [],
      });
    }
  }

  return results;
}

/**
 * 主函数：从目标生成计划
 */
export async function generatePlanFromGoal(
  input: GoalInput,
  options: PlanGenerationOptions = {}
): Promise<Plan> {
  const {
    includeTimeEstimation = true,
    estimateEachTask = false,
    maxRetries = 3,
  } = options;

  // 计算总可用时间
  const totalAvailableHours = calculateTotalAvailableHours(input);

  // 步骤 1: 任务分解
  const breakdownInput: TaskBreakdownInput = {
    goal: input.description || input.title,
    deadline: input.deadline.toISOString(),
    availableHours: totalAvailableHours,
  };

  const breakdownResult = await executeTaskBreakdown(breakdownInput, maxRetries);

  // 步骤 2: 时间估算（可选）
  let taskEstimations: Map<string, TimeEstimationOutput> = new Map();
  if (includeTimeEstimation && estimateEachTask) {
    taskEstimations = await estimateTasksTime(breakdownResult.tasks);
  }

  // 步骤 3: 组装最终计划
  const planTasks: PlanTask[] = breakdownResult.tasks.map((task, index) => ({
    ...task,
    timeEstimation: taskEstimations.get(task.id),
    order: index + 1,
  }));

  // 计算实际使用的总时间
  const actualTotalHours = planTasks.reduce((sum, task) => {
    if (task.timeEstimation) {
      return sum + task.timeEstimation.realistic;
    }
    return sum + task.estimatedHours;
  }, 0);

  // 计算工作天数
  const workingDays = Math.ceil(actualTotalHours / input.availableHoursPerDay);

  const plan: Plan = {
    id: generateId('plan'),
    title: input.title,
    description: input.description || '',
    tasks: planTasks,
    metadata: {
      createdAt: new Date().toISOString(),
      deadline: input.deadline.toISOString(),
      totalEstimatedHours: Math.round(actualTotalHours * 10) / 10,
      workingDays,
      dailyAverageHours: Math.round((actualTotalHours / Math.max(workingDays, 1)) * 10) / 10,
    },
    summary: breakdownResult.summary,
  };

  return plan;
}

/**
 * 流式生成计划（用于实时展示进度）
 */
export async function* generatePlanStream(
  input: GoalInput,
  options: PlanGenerationOptions = {}
): AsyncGenerator<
  | { type: 'start'; message: string }
  | { type: 'breakdown'; data: TaskBreakdownOutput }
  | { type: 'estimation'; taskId: string; data: TimeEstimationOutput }
  | { type: 'complete'; data: Plan }
  | { type: 'error'; message: string; stage?: string }
> {
  try {
    yield { type: 'start', message: '开始分析目标并分解任务...' };

    const totalAvailableHours = calculateTotalAvailableHours(input);
    const breakdownInput: TaskBreakdownInput = {
      goal: input.description || input.title,
      deadline: input.deadline.toISOString(),
      availableHours: totalAvailableHours,
    };

    const breakdownResult = await executeTaskBreakdown(breakdownInput, options.maxRetries);
    yield { type: 'breakdown', data: breakdownResult };

    // 估算阶段
    if (options.includeTimeEstimation && options.estimateEachTask) {
      const taskEstimations = new Map<string, TimeEstimationOutput>();

      for (const task of breakdownResult.tasks) {
        try {
          const estimation = await estimateTaskTime(task);
          taskEstimations.set(task.id, estimation);
          yield { type: 'estimation', taskId: task.id, data: estimation };
        } catch (error) {
          console.warn(`Estimation failed for task ${task.id}:`, error);
        }
      }
    }

    // 组装最终结果
    const plan = await generatePlanFromGoal(input, options);
    yield { type: 'complete', data: plan };
  } catch (error) {
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stage: error instanceof PlanGenerationError ? error.stage : undefined,
    };
  }
}

/**
 * 验证计划可行性
 */
export function validatePlanFeasibility(plan: Plan, availableHoursPerDay: number): {
  feasible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 检查每日平均工时
  if (plan.metadata.dailyAverageHours > availableHoursPerDay) {
    issues.push(
      `每日平均工时 (${plan.metadata.dailyAverageHours}h) 超过可用时间 (${availableHoursPerDay}h)`
    );
    suggestions.push('考虑延长截止日期或减少任务范围');
  }

  // 检查高优先级任务分布
  const highPriorityTasks = plan.tasks.filter((t) => t.priority === 'high');
  if (highPriorityTasks.length > plan.tasks.length * 0.5) {
    suggestions.push('高优先级任务过多，建议重新评估优先级');
  }

  // 检查任务依赖是否合理
  const taskIds = new Set(plan.tasks.map((t) => t.id));
  for (const task of plan.tasks) {
    for (const depId of task.dependencies) {
      if (!taskIds.has(depId)) {
        issues.push(`任务 "${task.title}" 依赖不存在的任务`);
      }
    }
  }

  // 检查截止日期
  const deadline = new Date(plan.metadata.deadline);
  const estimatedEnd = new Date();
  estimatedEnd.setDate(estimatedEnd.getDate() + plan.metadata.workingDays);

  if (estimatedEnd > deadline) {
    issues.push(`预计完成时间 (${estimatedEnd.toDateString()}) 超过截止日期`);
    suggestions.push('需要增加每日工作时间或调整截止日期');
  }

  return {
    feasible: issues.length === 0,
    issues,
    suggestions,
  };
}

// ==================== 导出 ====================

export {
  TaskBreakdownInput,
  TaskBreakdownOutput,
  TaskOutput,
  TimeEstimationInput,
  TimeEstimationOutput,
};
