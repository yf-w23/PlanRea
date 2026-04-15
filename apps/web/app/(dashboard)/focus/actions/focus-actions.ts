'use server';

/**
 * 专注模式 Server Actions
 * 处理专注会话的记录和统计查询
 */

import type {
  LogFocusSessionInput,
  GetFocusStatsQuery,
  FocusStats,
} from '../types';

// 模拟数据库 - 专注会话记录
interface FocusSessionRecord {
  id: string;
  userId: string;
  taskId: string | null;
  taskTitle: string;
  plannedDuration: number;
  actualDuration: number;
  completed: boolean;
  interruptions: number;
  ambientSound: string;
  notes?: string;
  createdAt: string;
}

// 内存存储（实际项目应使用数据库）
const focusSessions: FocusSessionRecord[] = [];

// 记录专注会话结果
export interface LogFocusSessionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

// 获取统计结果
export interface GetFocusStatsResult {
  success: boolean;
  stats?: FocusStats;
  error?: string;
}

/**
 * 记录专注会话
 * 将完成的专注会话保存到数据库
 */
export async function logFocusSessionAction(
  input: LogFocusSessionInput,
  userId: string = 'demo-user'
): Promise<LogFocusSessionResult> {
  try {
    // 验证输入
    if (input.plannedDuration <= 0) {
      return {
        success: false,
        error: '专注时长必须大于0',
      };
    }

    if (input.actualDuration < 0) {
      return {
        success: false,
        error: '实际专注时长不能为负数',
      };
    }

    // 创建会话记录
    const session: FocusSessionRecord = {
      id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      taskId: input.taskId,
      taskTitle: input.taskTitle || '未命名任务',
      plannedDuration: input.plannedDuration,
      actualDuration: input.actualDuration,
      completed: input.completed,
      interruptions: input.interruptions || 0,
      ambientSound: input.ambientSound,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    // 保存到数据库（模拟）
    focusSessions.push(session);

    // TODO: 实际项目中使用 Prisma 保存到数据库
    // const prisma = new PrismaClient();
    // await prisma.focusSession.create({ data: session });

    console.log('Focus session logged:', session.id);

    return {
      success: true,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Log focus session error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '记录专注会话时发生错误',
    };
  }
}

/**
 * 获取专注统计数据
 * 查询用户的专注历史统计
 */
export async function getFocusStatsAction(
  query: GetFocusStatsQuery = {},
  userId: string = 'demo-user'
): Promise<GetFocusStatsResult> {
  try {
    const { startDate, endDate, period = 'week' } = query;

    // 过滤当前用户的会话
    let userSessions = focusSessions.filter((s) => s.userId === userId);

    // 日期范围过滤
    if (startDate) {
      const start = new Date(startDate);
      userSessions = userSessions.filter((s) => new Date(s.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      userSessions = userSessions.filter((s) => new Date(s.createdAt) <= end);
    }

    // 计算统计数据
    const totalSessions = userSessions.length;
    const totalFocusTime = userSessions.reduce(
      (sum, s) => sum + s.actualDuration,
      0
    );
    const completedSessions = userSessions.filter((s) => s.completed).length;
    const interruptedSessions = userSessions.filter(
      (s) => s.interruptions > 0
    ).length;

    // 计算连续打卡天数
    const dailyStreak = calculateDailyStreak(userSessions);

    // 生成周统计
    const weeklyStats = generateWeeklyStats(userSessions);

    const stats: FocusStats = {
      totalSessions,
      totalFocusTime,
      completedSessions,
      interruptedSessions,
      dailyStreak,
      weeklyStats,
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Get focus stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取统计数据时发生错误',
    };
  }
}

/**
 * 计算连续打卡天数
 */
function calculateDailyStreak(sessions: FocusSessionRecord[]): number {
  if (sessions.length === 0) return 0;

  // 按日期分组
  const datesWithSessions = new Set(
    sessions.map((s) => s.createdAt.split('T')[0])
  );

  // 排序日期
  const sortedDates = Array.from(datesWithSessions).sort().reverse();

  // 计算连续天数
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (date === expectedDateStr || (i === 0 && date === today)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

/**
 * 生成周统计数据
 */
function generateWeeklyStats(
  sessions: FocusSessionRecord[]
): { day: string; minutes: number }[] {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();
  const weekStats: { day: string; minutes: number }[] = [];

  // 获取最近7天的数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = days[date.getDay()];

    // 计算当天的专注时长
    const daySessions = sessions.filter((s) =>
      s.createdAt.startsWith(dateStr)
    );
    const dayMinutes = daySessions.reduce(
      (sum, s) => sum + s.actualDuration,
      0
    );

    weekStats.push({
      day: i === 0 ? '今天' : dayName,
      minutes: dayMinutes,
    });
  }

  return weekStats;
}

/**
 * 获取今日专注记录
 */
export async function getTodayFocusSessionsAction(
  userId: string = 'demo-user'
): Promise<{ success: boolean; sessions?: FocusSessionRecord[]; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = focusSessions.filter(
      (s) => s.userId === userId && s.createdAt.startsWith(today)
    );

    return {
      success: true,
      sessions: todaySessions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取今日记录失败',
    };
  }
}
