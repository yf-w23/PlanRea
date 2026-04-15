/**
 * 专注模式类型定义
 */

// 专注时长预设
export type FocusPreset = 'pomodoro' | 'deep' | 'custom';

// 专注状态
export type FocusStatus = 'idle' | 'running' | 'paused' | 'completed' | 'break';

// 环境音效类型
export type AmbientSoundType = 'none' | 'rain' | 'coffee' | 'forest' | 'waves' | 'fire';

// 专注会话
export interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  duration: number; // 预设时长（秒）
  remainingTime: number; // 剩余时间（秒）
  status: FocusStatus;
  startTime: string | null;
  endTime: string | null;
  interruptions: number;
  ambientSound: AmbientSoundType;
  volume: number;
}

// 专注统计
export interface FocusStats {
  totalSessions: number;
  totalFocusTime: number; // 总专注时长（分钟）
  completedSessions: number;
  interruptedSessions: number;
  dailyStreak: number;
  weeklyStats: {
    day: string;
    minutes: number;
  }[];
}

// 任务类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes?: number;
  completed: boolean;
  category?: string;
}

// 专注预设配置
export interface FocusPresetConfig {
  id: FocusPreset;
  label: string;
  duration: number; // 分钟
  description: string;
  color: string;
}

// 环境音效配置
export interface AmbientSoundConfig {
  id: AmbientSoundType;
  label: string;
  icon: string;
  description: string;
}

// 记录专注会话输入
export interface LogFocusSessionInput {
  taskId: string | null;
  taskTitle: string;
  plannedDuration: number; // 分钟
  actualDuration: number; // 分钟
  completed: boolean;
  interruptions: number;
  ambientSound: AmbientSoundType;
  notes?: string;
}

// 获取统计查询参数
export interface GetFocusStatsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}
