/**
 * AI Planner 类型定义
 */

// 任务优先级
export type Priority = 'high' | 'medium' | 'low';

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// 单个任务
export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: Priority;
  dependencies: string[];
  category: string;
  order: number;
  status?: TaskStatus;
}

// 上传的文件
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  content?: string; // 文本文件内容
}

// 计划配置
export interface PlanConfig {
  deadline: Date;
  weeklyAvailableHours: number;
  workingDays: number[]; // 0=周日, 1=周一, ..., 6=周六
}

// 计划元数据
export interface PlanMetadata {
  createdAt: string;
  deadline: string;
  totalEstimatedHours: number;
  workingDays: number;
  dailyAverageHours: number;
}

// 完整计划
export interface Plan {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  metadata: PlanMetadata;
  summary: string;
}

// AI生成步骤
export type GenerationStep = 
  | { id: 'analyzing'; label: '分析目标...'; status: 'pending' | 'loading' | 'completed' }
  | { id: 'identifying'; label: '识别主要任务'; status: 'pending' | 'loading' | 'completed' }
  | { id: 'estimating'; label: '估算时间需求'; status: 'pending' | 'loading' | 'completed' }
  | { id: 'optimizing'; label: '优化任务顺序...'; status: 'pending' | 'loading' | 'completed' };

// 表单数据
export interface PlannerFormData {
  goal: string;
  uploadedFiles: UploadedFile[];
  deadline: Date;
  weeklyAvailableHours: number;
  workingDays: number[];
}

// 时间线任务（带调度信息）
export interface TimelineTask extends Task {
  scheduledStart?: string;
  scheduledEnd?: string;
  dayIndex?: number;
}

// 每日调度
export interface DailySchedule {
  date: string;
  tasks: TimelineTask[];
  totalHours: number;
}
