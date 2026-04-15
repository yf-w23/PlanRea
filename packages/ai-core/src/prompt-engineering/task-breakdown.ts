/**
 * 任务分解 Prompt 模板
 * 将用户目标分解为可执行的具体任务
 */

export interface TaskBreakdownInput {
  goal: string;
  deadline: string; // ISO 8601 格式日期
  availableHours: number; // 可用总小时数
}

export interface TaskOutput {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[]; // 依赖任务的ID列表
  category: string;
}

export interface TaskBreakdownOutput {
  tasks: TaskOutput[];
  totalEstimatedHours: number;
  summary: string;
}

/**
 * 生成任务分解的系统提示词
 */
export function getTaskBreakdownSystemPrompt(): string {
  return `你是一位专业的项目规划专家，擅长将复杂目标分解为结构化的任务列表。

你的职责：
1. 分析用户目标，识别关键里程碑和具体任务
2. 将任务分解为原子性、可执行的工作单元
3. 合理估算每个任务所需时间（以小时为单位）
4. 识别任务间的依赖关系
5. 根据重要性和紧急性设定任务优先级

输出要求：
- 必须返回有效的 JSON 格式
- 任务应具有明确的可交付成果
- 时间估算应现实可行，考虑学习和休息
- 任务总数应适合给定的时间框架

当前日期：${new Date().toISOString().split('T')[0]}`;
}

/**
 * 生成任务分解的用户提示词
 */
export function getTaskBreakdownUserPrompt(input: TaskBreakdownInput): string {
  return `请将以下目标分解为具体的任务列表：

【目标】
${input.goal}

【时间约束】
- 截止日期：${input.deadline}
- 可用总时长：${input.availableHours} 小时

请返回以下格式的 JSON：
{
  "tasks": [
    {
      "id": "task-001",
      "title": "任务标题",
      "description": "详细的任务描述",
      "estimatedHours": 2.5,
      "priority": "high",
      "dependencies": [],
      "category": "分类名称"
    }
  ],
  "totalEstimatedHours": 0,
  "summary": "任务分解说明"
}`;
}

/**
 * 验证任务分解输出的有效性
 */
export function validateTaskBreakdownOutput(
  output: unknown
): output is TaskBreakdownOutput {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const data = output as Record<string, unknown>;

  // 检查必需字段
  if (!Array.isArray(data.tasks)) {
    return false;
  }

  if (typeof data.totalEstimatedHours !== 'number') {
    return false;
  }

  // 验证每个任务的结构
  for (const task of data.tasks) {
    if (!task || typeof task !== 'object') {
      return false;
    }

    const t = task as Record<string, unknown>;
    if (typeof t.id !== 'string') return false;
    if (typeof t.title !== 'string') return false;
    if (typeof t.description !== 'string') return false;
    if (typeof t.estimatedHours !== 'number') return false;
    if (!['high', 'medium', 'low'].includes(t.priority as string)) return false;
    if (!Array.isArray(t.dependencies)) return false;
    if (typeof t.category !== 'string') return false;
  }

  return true;
}

/**
 * 生成任务分解的完整 Prompt 配置
 */
export function createTaskBreakdownPromptConfig(input: TaskBreakdownInput) {
  return {
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system' as const,
        content: getTaskBreakdownSystemPrompt(),
      },
      {
        role: 'user' as const,
        content: getTaskBreakdownUserPrompt(input),
      },
    ],
  };
}
