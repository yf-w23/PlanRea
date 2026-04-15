/**
 * OpenAI/DeepSeek 客户端配置
 * 兼容 OpenAI API 格式
 */

import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

// OpenAI 客户端配置接口
export interface OpenAIConfig {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  defaultModel?: string;
}

// 默认配置（支持 DeepSeek 等兼容 OpenAI 格式的 API）
const DEFAULT_CONFIG: Required<OpenAIConfig> = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1',
  organization: process.env.OPENAI_ORGANIZATION || '',
  defaultModel: process.env.OPENAI_BASE_URL?.includes('deepseek') 
    ? 'deepseek-chat' 
    : 'gpt-4-turbo-preview',
};

/**
 * 创建 OpenAI 客户端实例
 */
export function createOpenAIClient(config: Partial<OpenAIConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  if (!mergedConfig.apiKey) {
    throw new Error('OpenAI API Key is required. Set OPENAI_API_KEY environment variable.');
  }

  return createOpenAI({
    apiKey: mergedConfig.apiKey,
    baseURL: mergedConfig.baseURL,
    organization: mergedConfig.organization || undefined,
  });
}

// 单例客户端实例
let clientInstance: ReturnType<typeof createOpenAI> | null = null;

/**
 * 获取 OpenAI 客户端单例
 */
export function getOpenAIClient(config?: Partial<OpenAIConfig>): ReturnType<typeof createOpenAI> {
  if (!clientInstance || config) {
    clientInstance = createOpenAIClient(config);
  }
  return clientInstance;
}

/**
 * 流式文本生成选项
 */
export interface StreamTextOptions {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 生成流式文本响应
 */
export async function streamOpenAIResponse(options: StreamTextOptions) {
  const openai = getOpenAIClient();
  const model = options.model || DEFAULT_CONFIG.defaultModel;

  const result = await streamText({
    model: openai(model),
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    maxTokens: options.maxTokens ?? 4000,
    maxRetries: 3,
  });

  return result.toTextStreamResponse();
}

/**
 * 非流式文本生成选项
 */
export interface GenerateTextOptions {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 生成完整文本响应（非流式）
 */
export async function generateOpenAIResponse(options: GenerateTextOptions) {
  const openai = getOpenAIClient();
  const model = options.model || DEFAULT_CONFIG.defaultModel;

  const result = await generateText({
    model: openai(model),
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    maxTokens: options.maxTokens ?? 4000,
    maxRetries: 3,
  });

  return {
    text: result.text,
    usage: {
      promptTokens: (result.usage as any).promptTokens || 0,
      completionTokens: (result.usage as any).completionTokens || 0,
      totalTokens: (result.usage as any).totalTokens || 0,
    },
    finishReason: result.finishReason,
  };
}

/**
 * 带 JSON 输出的结构化响应生成
 */
export async function generateStructuredResponse<T>(
  options: GenerateTextOptions
): Promise<T> {
  // 添加 JSON 格式指示
  const messagesWithJsonHint = [
    ...options.messages,
    {
      role: 'user' as const,
      content: 'Please respond in valid JSON format.',
    },
  ];

  const result = await generateOpenAIResponse({
    ...options,
    messages: messagesWithJsonHint,
  });

  try {
    // 尝试解析 JSON
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return JSON.parse(result.text) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}\nResponse: ${result.text}`);
  }
}

/**
 * 可用的模型列表
 */
export const AVAILABLE_MODELS = {
  // OpenAI 模型
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
  // DeepSeek 模型
  DEEPSEEK_CHAT: 'deepseek-chat',
  DEEPSEEK_CODER: 'deepseek-coder',
} as const;

/**
 * 模型能力配置
 */
export const MODEL_CAPABILITIES: Record<string, { maxTokens: number; supportsJson: boolean; costPer1k: { input: number; output: number } }> = {
  'gpt-4-turbo-preview': {
    maxTokens: 128000,
    supportsJson: true,
    costPer1k: { input: 0.01, output: 0.03 },
  },
  'gpt-4': {
    maxTokens: 8192,
    supportsJson: true,
    costPer1k: { input: 0.03, output: 0.06 },
  },
  'gpt-3.5-turbo': {
    maxTokens: 16385,
    supportsJson: true,
    costPer1k: { input: 0.0005, output: 0.0015 },
  },
  'gpt-4o': {
    maxTokens: 128000,
    supportsJson: true,
    costPer1k: { input: 0.005, output: 0.015 },
  },
  'gpt-4o-mini': {
    maxTokens: 128000,
    supportsJson: true,
    costPer1k: { input: 0.00015, output: 0.0006 },
  },
  // DeepSeek 模型
  'deepseek-chat': {
    maxTokens: 64000,
    supportsJson: true,
    costPer1k: { input: 0.00014, output: 0.00028 },
  },
  'deepseek-coder': {
    maxTokens: 64000,
    supportsJson: true,
    costPer1k: { input: 0.00014, output: 0.00028 },
  },
};

/**
 * 根据任务选择合适的模型
 */
export function selectModelForTask(task: 'breakdown' | 'estimation' | 'scheduling' | 'general'): string {
  const isDeepSeek = process.env.OPENAI_BASE_URL?.includes('deepseek');
  
  if (isDeepSeek) {
    return AVAILABLE_MODELS.DEEPSEEK_CHAT;
  }
  
  switch (task) {
    case 'breakdown':
    case 'estimation':
    case 'scheduling':
      return AVAILABLE_MODELS.GPT4_TURBO;
    case 'general':
    default:
      return AVAILABLE_MODELS.GPT35_TURBO;
  }
}

/**
 * 估算 API 调用成本
 */
export function estimateAPICost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const capabilities = MODEL_CAPABILITIES[model];
  if (!capabilities) {
    return 0;
  }

  const inputCost = (promptTokens / 1000) * capabilities.costPer1k.input;
  const outputCost = (completionTokens / 1000) * capabilities.costPer1k.output;

  return Math.round((inputCost + outputCost) * 10000) / 10000;
}
