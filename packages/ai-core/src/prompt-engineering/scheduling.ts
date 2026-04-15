/**
 * 调度优化 Prompt 模板
 * 优化任务调度顺序，考虑约束条件和效率最大化
 */

export interface Task {
  id: string;
  title: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  category: string;
  deadline?: string;
}

export interface UserPreference {
  preferredWorkHours?: {
    start: string;
    end: string;
  };
  maxHoursPerDay?: number;
  preferredWorkDays?: number[];
  breakDuration?: number;
  focusBlocks?: Array<{
    duration: number;
    frequency: number;
  }>;
}

export interface SchedulingInput {
  tasks: Task[];
  userPreferences: UserPreference;
  constraints?: {
    fixedAppointments?: Array<{
      title: string;
      startTime: string;
      endTime: string;
    }>;
    blockedTimeRanges?: Array<{
      dayOfWeek: number;
      start: string;
      end: string;
    }>;
  };
  optimizationTarget?: 'minimizeTotalTime' | 'balanceWorkload' | 'maximizeProductivity';
}

export interface ScheduledTask extends Task {
  scheduledStart: string;
  scheduledEnd: string;
  dayIndex: number;
}

export interface DailySchedule {
  date: string;
  tasks: ScheduledTask[];
  totalHours: number;
  focusBlocksUsed: number;
}

export interface SchedulingOutput {
  schedule: DailySchedule[];
  unscheduledTasks: Task[];
  metrics: {
    totalDays: number;
    totalWorkHours: number;
    averageDailyHours: number;
    priorityDistribution: Record<string, number>;
  };
  suggestions: string[];
}

export function getSchedulingSystemPrompt(): string {
  return `你是一位专业的日程规划专家，擅长使用运筹学和项目管理的最佳实践来优化任务调度。

调度原则：
1. 尊重任务依赖关系，前置任务必须首先完成
2. 高优先级任务优先安排在高效时间段
3. 考虑用户的工作习惯，合理安排专注块
4. 保持工作负载平衡，避免某一天过载
5. 预留缓冲时间应对不确定性

优化策略：
- 关键路径优先：优先调度影响整体进度的任务
- 资源均衡：分散负载，保持每日工作时间合理
- 上下文切换最小化：相关任务集中安排`;
}

export function getSchedulingUserPrompt(input: SchedulingInput): string {
  const optimizationStrategy = {
    minimizeTotalTime: '最小化总完成时间',
    balanceWorkload: '平衡每日工作负载',
    maximizeProductivity: '最大化生产效率',
  }[input.optimizationTarget || 'balanceWorkload'];

  return `请为以下任务创建优化的日程安排：

【任务列表】
${input.tasks.map(t => `- [${t.id}] ${t.title} (时长: ${t.estimatedHours}h, 优先级: ${t.priority})`).join('\n')}

【用户偏好】
- 首选工作时段：${input.userPreferences.preferredWorkHours?.start || '09:00'} - ${input.userPreferences.preferredWorkHours?.end || '18:00'}
- 每日最大工作时长：${input.userPreferences.maxHoursPerDay || 8}小时

【优化目标】
${optimizationStrategy}

请返回以下格式的 JSON：
{
  "schedule": [
    {
      "date": "2024-01-15",
      "tasks": [{"id": "task-001", "scheduledStart": "2024-01-15T09:00:00Z", "scheduledEnd": "2024-01-15T11:00:00Z"}],
      "totalHours": 6,
      "focusBlocksUsed": 2
    }
  ],
  "unscheduledTasks": [],
  "metrics": {"totalDays": 5, "totalWorkHours": 20, "averageDailyHours": 4},
  "suggestions": []
}`;
}

export function validateSchedulingOutput(output: unknown): output is SchedulingOutput {
  if (!output || typeof output !== 'object') return false;
  const data = output as Record<string, unknown>;
  if (!Array.isArray(data.schedule)) return false;
  if (!data.metrics || typeof data.metrics !== 'object') return false;
  if (!Array.isArray(data.suggestions)) return false;
  return true;
}

export function createSchedulingPromptConfig(input: SchedulingInput) {
  return {
    model: 'gpt-4-turbo-preview',
    temperature: 0.2,
    max_tokens: 6000,
    response_format: { type: 'json_object' as const },
    messages: [
      { role: 'system' as const, content: getSchedulingSystemPrompt() },
      { role: 'user' as const, content: getSchedulingUserPrompt(input) },
    ],
  };
}
