// 模拟数据 - 用于开发阶段

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // 分钟
  location?: string;
  scheduledTime?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Plan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
}

export interface EnergyLevel {
  hour: number;
  level: number; // 0-100
  label: string;
}

// 示例任务数据
export const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成产品需求文档',
    description: '撰写本周产品迭代的需求文档',
    duration: 120,
    location: '办公室',
    scheduledTime: '09:00',
    completed: false,
    priority: 'high',
  },
  {
    id: '2',
    title: '团队周会',
    description: '同步本周工作进展',
    duration: 60,
    location: '会议室 A',
    scheduledTime: '11:00',
    completed: false,
    priority: 'medium',
  },
  {
    id: '3',
    title: '代码审查',
    description: '审查前端团队的 PR',
    duration: 90,
    location: '工位',
    scheduledTime: '14:00',
    completed: false,
    priority: 'medium',
  },
  {
    id: '4',
    title: '设计评审',
    description: '新产品界面设计评审',
    duration: 60,
    location: '会议室 B',
    scheduledTime: '16:00',
    completed: false,
    priority: 'high',
  },
  {
    id: '5',
    title: '学习新技术',
    description: '阅读 React 19 新特性文档',
    duration: 45,
    location: '家中',
    scheduledTime: '20:00',
    completed: false,
    priority: 'low',
  },
];

// 今日最重要的任务（今日专注）
export const todaysFocusTask: Task = {
  id: 'focus-1',
  title: '深度工作：完成核心功能开发',
  description: '专注完成用户管理模块的核心功能',
  duration: 180,
  location: '静音区',
  scheduledTime: '09:30',
  completed: false,
  priority: 'high',
};

// 示例计划数据
export const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    title: 'Q1 产品迭代',
    description: '第一季度产品功能迭代计划',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    tasks: mockTasks,
    completedTasks: 12,
    totalTasks: 20,
  },
];

// 24小时能量水平预测数据
export const mockEnergyLevels: EnergyLevel[] = [
  { hour: 0, level: 20, label: '低' },
  { hour: 1, level: 15, label: '低' },
  { hour: 2, level: 10, label: '低' },
  { hour: 3, level: 8, label: '低' },
  { hour: 4, level: 10, label: '低' },
  { hour: 5, level: 20, label: '低' },
  { hour: 6, level: 35, label: '中' },
  { hour: 7, level: 50, label: '中' },
  { hour: 8, level: 70, label: '高' },
  { hour: 9, level: 85, label: '高' },
  { hour: 10, level: 95, label: '高' },
  { hour: 11, level: 90, label: '高' },
  { hour: 12, level: 75, label: '中' },
  { hour: 13, level: 60, label: '中' },
  { hour: 14, level: 70, label: '高' },
  { hour: 15, level: 80, label: '高' },
  { hour: 16, level: 75, label: '中' },
  { hour: 17, level: 60, label: '中' },
  { hour: 18, level: 50, label: '中' },
  { hour: 19, level: 55, label: '中' },
  { hour: 20, level: 45, label: '中' },
  { hour: 21, level: 35, label: '中' },
  { hour: 22, level: 30, label: '低' },
  { hour: 23, level: 25, label: '低' },
];

// AI 提示语（根据能量水平）
export const getAIPrompt = (energyLevel: number): string => {
  if (energyLevel >= 80) {
    return '你现在精力充沛，适合深度工作，建议处理最复杂的任务';
  } else if (energyLevel >= 60) {
    return '你现在的状态不错，适合进行创造性工作或会议';
  } else if (energyLevel >= 40) {
    return '你的精力一般，适合处理常规事务性工作';
  } else {
    return '你现在精力较低，建议休息或进行轻松的工作';
  }
};

// 获取当前能量水平
export const getCurrentEnergyLevel = (): EnergyLevel => {
  const currentHour = new Date().getHours();
  return (
    mockEnergyLevels.find((e) => e.hour === currentHour) || mockEnergyLevels[9]
  );
};

// 获取本周统计
export const getWeeklyStats = () => {
  const completedTasks = mockTasks.filter((t) => t.completed).length;
  const totalTasks = mockTasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    completedTasks,
    totalTasks,
    completionRate,
  };
};
