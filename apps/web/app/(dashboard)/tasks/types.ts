/**
 * 任务管理模块类型定义
 */

// 任务优先级
export type Priority = 'high' | 'medium' | 'low';

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deferred';

// 排序选项
export type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'estimatedTime';

// 筛选选项
export type FilterOption = 'all' | 'in_progress' | 'completed' | 'deferred';

// 子任务/检查清单项
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

// 时间记录
export interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // 分钟
  note?: string;
}

// 备注
export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// 所属计划信息
export interface PlanInfo {
  id: string;
  title: string;
}

// 完整任务类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes: number;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  deferredUntil?: string;
  plan?: PlanInfo;
  subTasks: SubTask[];
  notes: Note[];
  timeEntries: TimeEntry[];
  tags: string[];
  order: number;
}

// 创建任务输入
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  estimatedMinutes: number;
  dueDate?: string;
  planId?: string;
  tags?: string[];
}

// 更新任务输入
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  estimatedMinutes?: number;
  dueDate?: string | null;
  planId?: string | null;
  tags?: string[];
}

// 任务统计
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  deferred: number;
  overdue: number;
  completionRate: number;
}

// 任务查询参数
export interface TaskQueryParams {
  filter?: FilterOption;
  search?: string;
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  planId?: string;
}
