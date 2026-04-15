/**
 * 时间估算 Prompt 模板
 * 对单个任务或任务列表进行精确的时间估算
 */

export interface TimeEstimationInput {
  task: {
    id: string;
    title: string;
    description: string;
  };
  context?: {
    similarTasks?: Array<{
      title: string;
      actualHours: number;
    }>;
    userSkillLevel?: 'beginner' | 'intermediate' | 'expert';
    complexity?: 'simple' | 'moderate' | 'complex';
  };
}

export interface TimeEstimationOutput {
  optimistic: number; // 乐观估算（小时）
  pessimistic: number; // 悲观估算（小时）
  realistic: number; // 现实估算（小时）
  confidence: number; // 置信度 (0-1)
  breakdown: {
    coreWork: number;
    research: number;
    review: number;
    buffer: number;
  };
  assumptions: string[];
  risks: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

/**
 * 生成时间估算的系统提示词
 */
export function getTimeEstimationSystemPrompt(): string {
  return `你是一位经验丰富的时间估算专家，擅长使用 PERT（计划评审技术）方法进行准确的时间预测。

估算原则：
1. 使用三点估算法：乐观、现实、悲观
2. 考虑任务的各个阶段：核心工作、研究学习、审查修改
3. 预留适当的缓冲时间应对不确定性
4. 基于用户技能水平调整估算
5. 识别并说明估算假设和潜在风险

PERT 公式：
- 期望时间 = (乐观 + 4×现实 + 悲观) / 6
- 标准差 = (悲观 - 乐观) / 6

输出要求：
- 所有时间单位为小时，保留一位小数
- 置信度用 0-1 之间的小数表示
- 明确列出所有假设条件
- 识别至少 2 个潜在风险`;
}

/**
 * 生成时间估算的用户提示词
 */
export function getTimeEstimationUserPrompt(input: TimeEstimationInput): string {
  const contextStr = input.context
    ? `
【上下文信息】
- 用户技能水平：${input.context.userSkillLevel || 'intermediate'}
- 任务复杂度：${input.context.complexity || 'moderate'}
${input.context.similarTasks ? `
【历史参考数据】
${input.context.similarTasks
  .map((t) => `- ${t.title}: ${t.actualHours}小时`)
  .join('\n')}` : ''}
`
    : '';

  return `请对以下任务进行详细的时间估算：

【任务信息】
- 任务ID：${input.task.id}
- 任务标题：${input.task.title}
- 任务描述：${input.task.description}
${contextStr}

请返回以下格式的 JSON：
{
  "optimistic": 0,
  "pessimistic": 0,
  "realistic": 0,
  "confidence": 0.85,
  "breakdown": {
    "coreWork": 0,
    "research": 0,
    "review": 0,
    "buffer": 0
  },
  "assumptions": [
    "假设条件1",
    "假设条件2"
  ],
  "risks": [
    {
      "description": "风险描述",
      "impact": "low|medium|high",
      "mitigation": "缓解措施"
    }
  ]
}`;
}

/**
 * 计算 PERT 期望时间
 */
export function calculatePERT(
  optimistic: number,
  realistic: number,
  pessimistic: number
): {
  expected: number;
  standardDeviation: number;
  variance: number;
} {
  const expected = (optimistic + 4 * realistic + pessimistic) / 6;
  const variance = Math.pow((pessimistic - optimistic) / 6, 2);
  const standardDeviation = Math.sqrt(variance);

  return {
    expected: Math.round(expected * 10) / 10,
    standardDeviation: Math.round(standardDeviation * 10) / 10,
    variance: Math.round(variance * 100) / 100,
  };
}

/**
 * 验证时间估算输出的有效性
 */
export function validateTimeEstimationOutput(
  output: unknown
): output is TimeEstimationOutput {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const data = output as Record<string, unknown>;

  // 检查必需字段
  const requiredNumbers = ['optimistic', 'pessimistic', 'realistic', 'confidence'];
  for (const field of requiredNumbers) {
    if (typeof data[field] !== 'number') return false;
  }

  // 验证置信度范围
  if (data.confidence < 0 || data.confidence > 1) return false;

  // 验证乐观 <= 现实 <= 悲观
  if (data.optimistic > data.realistic || data.realistic > data.pessimistic) {
    return false;
  }

  // 验证 breakdown
  if (!data.breakdown || typeof data.breakdown !== 'object') return false;
  const breakdown = data.breakdown as Record<string, unknown>;
  const breakdownFields = ['coreWork', 'research', 'review', 'buffer'];
  for (const field of breakdownFields) {
    if (typeof breakdown[field] !== 'number') return false;
  }

  // 验证 assumptions
  if (!Array.isArray(data.assumptions)) return false;

  // 验证 risks
  if (!Array.isArray(data.risks)) return false;

  return true;
}

/**
 * 生成时间估算的完整 Prompt 配置
 */
export function createTimeEstimationPromptConfig(input: TimeEstimationInput) {
  return {
    model: 'gpt-4-turbo-preview',
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system' as const,
        content: getTimeEstimationSystemPrompt(),
      },
      {
        role: 'user' as const,
        content: getTimeEstimationUserPrompt(input),
      },
    ],
  };
}
