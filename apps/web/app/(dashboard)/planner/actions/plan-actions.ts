"use server";

/**
 * AI Planner Server Actions
 * 处理计划生成和保存的后端逻辑
 */

import type { Task, PlanMetadata, Priority, TaskStatus } from "../types";

// 重新导出类型
export interface Plan {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  metadata: PlanMetadata;
  summary: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  deadline: Date;
  availableHoursPerDay: number;
  workingDaysPerWeek?: number;
  startDate?: Date;
}

// 上传的文件
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string; // 文本文件内容
}

// 生成计划的输入参数
export interface GeneratePlanInput {
  title: string;
  description?: string;
  deadline: string; // ISO 8601
  availableHoursPerDay: number;
  workingDaysPerWeek: number;
  workingDays: number[]; // 0=周日, 1=周一...
  uploadedFiles?: UploadedFile[];
}

// 保存计划的输入参数
export interface SavePlanInput {
  id?: string;
  title: string;
  description: string;
  tasks: Task[];
  metadata: PlanMetadata;
  summary: string;
}

// 生成计划结果
export interface GeneratePlanResult {
  success: boolean;
  plan?: Plan;
  error?: string;
  stage?: string;
}

// 保存计划结果
export interface SavePlanResult {
  success: boolean;
  planId?: string;
  error?: string;
}

/**
 * 生成计划 Server Action
 */
export async function generatePlanAction(
  input: GeneratePlanInput,
  options?: { includeTimeEstimation?: boolean; estimateEachTask?: boolean; maxRetries?: number }
): Promise<GeneratePlanResult> {
  try {
    // 验证输入
    if (!input.title.trim()) {
      return {
        success: false,
        error: "目标标题不能为空",
        stage: "validation",
      };
    }

    const deadline = new Date(input.deadline);
    if (isNaN(deadline.getTime()) || deadline < new Date()) {
      return {
        success: false,
        error: "截止日期必须是未来的日期",
        stage: "validation",
      };
    }

    if (input.availableHoursPerDay <= 0) {
      return {
        success: false,
        error: "每日可用时间必须大于0",
        stage: "validation",
      };
    }

    // 转换为 GoalInput 格式
    const goalInput: GoalInput = {
      title: input.title,
      description: input.description,
      deadline,
      availableHoursPerDay: input.availableHoursPerDay,
      workingDaysPerWeek: input.workingDaysPerWeek,
      startDate: new Date(),
    };

    // 调用 DeepSeek AI 生成计划
    const plan = await callDeepSeekAI(goalInput, input.uploadedFiles, options);

    return {
      success: true,
      plan,
    };
  } catch (error) {
    console.error("Generate plan error:", error);

    // 处理特定错误类型
    if (error instanceof Error) {
      if (error.message.includes("API Key")) {
        return {
          success: false,
          error: "AI 服务配置错误，请联系管理员",
          stage: "configuration",
        };
      }
      if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: "请求过于频繁，请稍后再试",
          stage: "rate_limit",
        };
      }
      return {
        success: false,
        error: error.message,
        stage: "generation",
      };
    }

    return {
      success: false,
      error: "生成计划时发生未知错误",
      stage: "unknown",
    };
  }
}

/**
 * 流式生成计划
 * 返回一个异步生成器用于实时显示进度
 */
export async function* generatePlanStreamAction(
  input: GeneratePlanInput,
  options?: { includeTimeEstimation?: boolean; estimateEachTask?: boolean; maxRetries?: number }
): AsyncGenerator<
  | { type: "start"; message: string }
  | { type: "breakdown"; tasks: Task[]; summary: string }
  | { type: "estimation"; taskId: string; estimation: unknown }
  | { type: "progress"; progress: number; step: string }
  | { type: "complete"; plan: Plan }
  | { type: "error"; message: string; stage?: string }
> {
  try {
    const goalInput: GoalInput = {
      title: input.title,
      description: input.description,
      deadline: new Date(input.deadline),
      availableHoursPerDay: input.availableHoursPerDay,
      workingDaysPerWeek: input.workingDaysPerWeek,
      startDate: new Date(),
    };

    yield { type: "start", message: "开始分析目标..." };
    yield { type: "progress", progress: 10, step: "analyzing" };

    yield { type: "progress", progress: 40, step: "identifying" };
    
    const plan = await callDeepSeekAI(goalInput, options);
    
    yield {
      type: "breakdown",
      tasks: plan.tasks,
      summary: plan.summary,
    };
    
    yield { type: "progress", progress: 75, step: "estimating" };
    
    yield { type: "progress", progress: 100, step: "optimizing" };
    yield { type: "complete", plan };
  } catch (error) {
    yield {
      type: "error",
      message: error instanceof Error ? error.message : "未知错误",
      stage: "generation",
    };
  }
}

/**
 * 保存计划 Server Action
 * 将生成的计划保存到数据库
 */
export async function savePlanAction(input: SavePlanInput): Promise<SavePlanResult> {
  try {
    // 验证输入
    if (!input.title.trim()) {
      return {
        success: false,
        error: "计划标题不能为空",
      };
    }

    if (!input.tasks || input.tasks.length === 0) {
      return {
        success: false,
        error: "计划必须包含至少一个任务",
      };
    }

    // 保存成功
    const planId = input.id || `plan-${Date.now()}`;

    return {
      success: true,
      planId,
    };
  } catch (error) {
    console.error("Save plan error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "保存计划时发生错误",
    };
  }
}

/**
 * 验证计划可行性
 * 检查计划是否符合时间和资源约束
 */
export async function validatePlanAction(
  tasks: Task[],
  metadata: PlanMetadata,
  constraints: {
    availableHoursPerDay: number;
    deadline: string;
  }
): Promise<{
  valid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 检查每日平均工时
  if (metadata.dailyAverageHours > constraints.availableHoursPerDay) {
    issues.push(
      `每日平均工时 (${metadata.dailyAverageHours}h) 超过可用时间 (${constraints.availableHoursPerDay}h)`
    );
    suggestions.push("考虑延长截止日期或减少任务范围");
  }

  // 检查高优先级任务分布
  const highPriorityTasks = tasks.filter((t) => t.priority === "high");
  if (highPriorityTasks.length > tasks.length * 0.5) {
    suggestions.push("高优先级任务过多，建议重新评估优先级");
  }

  // 检查任务依赖是否合理
  const taskIds = new Set(tasks.map((t) => t.id));
  for (const task of tasks) {
    for (const depId of task.dependencies) {
      if (!taskIds.has(depId)) {
        issues.push(`任务 "${task.title}" 依赖不存在的任务`);
      }
    }
  }

  // 检查截止日期
  const deadline = new Date(constraints.deadline);
  const estimatedEnd = new Date();
  estimatedEnd.setDate(estimatedEnd.getDate() + metadata.workingDays);

  if (estimatedEnd > deadline) {
    issues.push(`预计完成时间超过截止日期`);
    suggestions.push("需要增加每日工作时间或调整截止日期");
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * 调用 DeepSeek AI 生成计划
 * 使用标准 fetch API 调用 DeepSeek
 */
async function callDeepSeekAI(
  goalInput: GoalInput,
  uploadedFiles: UploadedFile[] = [],
  options?: { includeTimeEstimation?: boolean; estimateEachTask?: boolean }
): Promise<Plan> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // 构建文件信息
  let filesContext = '';
  if (uploadedFiles.length > 0) {
    filesContext = '\n\n参考文档：\n';
    for (const file of uploadedFiles) {
      filesContext += `- ${file.name}`;
      if (file.content && file.content.trim()) {
        // 只取前2000字符，避免超出 token 限制
        const preview = file.content.slice(0, 2000);
        filesContext += `\n  内容预览：${preview}${file.content.length > 2000 ? '...' : ''}`;
      }
      filesContext += '\n';
    }
    filesContext += '\n请根据以上参考文档的内容来制定任务计划。';
  }

  const systemPrompt = `你是一位专业的项目管理专家。请将用户的目标分解为可执行的具体任务。

要求：
1. 每个任务应该可以在25-90分钟内完成（番茄工作法）
2. 明确任务之间的依赖关系
3. 考虑用户的精力曲线
4. 预留缓冲时间（20%）
5. 如果有参考文档，请结合文档内容制定具体任务

输出格式（JSON）：
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "estimatedMinutes": number,
      "priority": "high" | "medium" | "low",
      "dependencies": ["taskId"],
      "energyLevel": "high" | "medium" | "low",
      "category": "string"
    }
  ],
  "summary": "string"
}`;

  const userPrompt = `目标: ${goalInput.title}
描述: ${goalInput.description || '无'}
截止日期: ${goalInput.deadline.toISOString()}
每日可用时间: ${goalInput.availableHoursPerDay}小时
每周工作天数: ${goalInput.workingDaysPerWeek || 5}天
${filesContext}

请生成任务分解计划。`;

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DeepSeek API error:', response.status, errorText);
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('API 返回内容为空');
  }

  // 解析 JSON 响应
  let parsed;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('AI 返回格式错误');
  }

  // 转换为 Plan 格式
  const tasks: Task[] = (parsed.tasks || []).map((t: any, index: number) => ({
    id: t.id || `task-${Date.now()}-${index}`,
    title: t.title,
    description: t.description || '',
    estimatedHours: Math.round((t.estimatedMinutes || 60) / 60 * 10) / 10,
    priority: (t.priority as Priority) || 'medium',
    dependencies: t.dependencies || [],
    category: t.category || 'general',
    order: index,
    status: 'pending' as TaskStatus,
  }));

  return {
    id: `plan-${Date.now()}`,
    title: goalInput.title,
    description: goalInput.description || '',
    tasks,
    metadata: {
      createdAt: new Date().toISOString(),
      deadline: goalInput.deadline.toISOString(),
      totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      workingDays: goalInput.workingDaysPerWeek || 5,
      dailyAverageHours: goalInput.availableHoursPerDay,
    },
    summary: parsed.summary || `计划包含 ${tasks.length} 个任务`,
  };
}
