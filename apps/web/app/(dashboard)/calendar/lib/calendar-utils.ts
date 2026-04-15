import {
  format,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  addHours,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  areIntervalsOverlapping,
  differenceInMinutes,
  setHours,
  setMinutes,
  parseISO,
  isValid,
} from 'date-fns';

export type ViewType = 'day' | 'week' | 'month';

export type TimeBlockType = 'task' | 'event' | 'free';

export interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: TimeBlockType;
  color?: string;
  description?: string;
  isDraggable?: boolean;
  source?: 'google' | 'local';
  taskId?: string;
}

export interface Conflict {
  id: string;
  blocks: TimeBlock[];
  start: Date;
  end: Date;
}

export interface SuggestedSlot {
  id: string;
  start: Date;
  end: Date;
  score: number;
  reason: string;
  reasonType: 'optimal' | 'workload_balance' | 'preference' | 'deadline';
}

// 日期格式化
export function formatDate(date: Date, pattern: string = 'yyyy-MM-dd'): string {
  return format(date, pattern);
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm');
}

export function formatShortDate(date: Date): string {
  return format(date, 'MM/dd');
}

export function formatWeekDay(date: Date): string {
  return format(date, 'EEE');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

// 获取周视图日期范围
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // 周一作为一周开始
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

// 获取24小时时间段
export function getHoursOfDay(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

// 获取时间块在日历上的位置（百分比）
export function getTimeBlockPosition(
  block: TimeBlock,
  dayStart: Date
): { top: number; height: number } {
  const startMinutes = differenceInMinutes(block.start, dayStart);
  const duration = differenceInMinutes(block.end, block.start);
  const minutesInDay = 24 * 60;
  
  return {
    top: (startMinutes / minutesInDay) * 100,
    height: (duration / minutesInDay) * 100,
  };
}

// 计算拖拽后的新时间
export function calculateNewTime(
  originalStart: Date,
  originalEnd: Date,
  deltaY: number,
  containerHeight: number,
  snapMinutes: number = 15
): { start: Date; end: Date } {
  const minutesInDay = 24 * 60;
  const deltaMinutes = Math.round((deltaY / containerHeight) * minutesInDay / snapMinutes) * snapMinutes;
  
  const duration = differenceInMinutes(originalEnd, originalStart);
  const newStart = addMinutesSafe(originalStart, deltaMinutes);
  const newEnd = addMinutesSafe(newStart, duration);
  
  return { start: newStart, end: newEnd };
}

function addMinutesSafe(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

// 检测时间冲突
export function detectConflicts(blocks: TimeBlock[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const processedPairs = new Set<string>();
  
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const blockA = blocks[i];
      const blockB = blocks[j];
      const pairId = [blockA.id, blockB.id].sort().join('-');
      
      if (processedPairs.has(pairId)) continue;
      processedPairs.add(pairId);
      
      if (areIntervalsOverlapping(
        { start: blockA.start, end: blockA.end },
        { start: blockB.start, end: blockB.end }
      )) {
        const conflictStart = new Date(Math.max(blockA.start.getTime(), blockB.start.getTime()));
        const conflictEnd = new Date(Math.min(blockA.end.getTime(), blockB.end.getTime()));
        
        conflicts.push({
          id: `conflict-${pairId}`,
          blocks: [blockA, blockB],
          start: conflictStart,
          end: conflictEnd,
        });
      }
    }
  }
  
  return conflicts;
}

// 检查特定时间段是否可用
export function isTimeSlotAvailable(
  start: Date,
  end: Date,
  existingBlocks: TimeBlock[],
  excludeBlockId?: string
): boolean {
  return !existingBlocks.some(block => {
    if (excludeBlockId && block.id === excludeBlockId) return false;
    return areIntervalsOverlapping(
      { start, end },
      { start: block.start, end: block.end }
    );
  });
}

// 查找可用的空闲时间段
export function findAvailableSlots(
  date: Date,
  durationMinutes: number,
  existingBlocks: TimeBlock[],
  workStartHour: number = 9,
  workEndHour: number = 18
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  const dayStart = setHours(startOfDay(date), workStartHour);
  const dayEnd = setHours(startOfDay(date), workEndHour);
  
  // 获取当天的所有时间块
  const dayBlocks = existingBlocks.filter(block => 
    isSameDay(block.start, date)
  ).sort((a, b) => a.start.getTime() - b.start.getTime());
  
  let currentTime = dayStart;
  
  for (const block of dayBlocks) {
    if (block.start > currentTime) {
      const slotEnd = new Date(Math.min(block.start.getTime(), dayEnd.getTime()));
      const slotDuration = differenceInMinutes(slotEnd, currentTime);
      
      if (slotDuration >= durationMinutes) {
        slots.push({
          start: new Date(currentTime),
          end: slotEnd,
        });
      }
    }
    currentTime = new Date(Math.max(currentTime.getTime(), block.end.getTime()));
  }
  
  // 检查最后一个块之后的时间
  if (currentTime < dayEnd) {
    const slotDuration = differenceInMinutes(dayEnd, currentTime);
    if (slotDuration >= durationMinutes) {
      slots.push({
        start: currentTime,
        end: dayEnd,
      });
    }
  }
  
  return slots;
}

// 生成AI建议的时间段（模拟）
export function generateSuggestedSlots(
  date: Date,
  durationMinutes: number,
  existingBlocks: TimeBlock[],
  preferences?: {
    preferredStartHour?: number;
    avoidHours?: number[];
  }
): SuggestedSlot[] {
  const availableSlots = findAvailableSlots(date, durationMinutes, existingBlocks);
  const suggestions: SuggestedSlot[] = [];
  
  availableSlots.forEach((slot, index) => {
    let score = 50;
    let reason = '可用时间段';
    let reasonType: SuggestedSlot['reasonType'] = 'optimal';
    
    const hour = slot.start.getHours();
    
    // 上午时段偏好
    if (hour >= 9 && hour <= 11) {
      score += 20;
      reason = '上午精力充沛，适合专注工作';
      reasonType = 'optimal';
    }
    
    // 避免饭后时段
    if (hour === 12 || hour === 13) {
      score -= 10;
      reason = '午休时间，建议安排轻松任务';
      reasonType = 'preference';
    }
    
    // 用户偏好时间
    if (preferences?.preferredStartHour && hour === preferences.preferredStartHour) {
      score += 15;
      reason = '符合您的偏好工作时间';
      reasonType = 'preference';
    }
    
    // 避免特定时段
    if (preferences?.avoidHours?.includes(hour)) {
      score -= 20;
    }
    
    // 工作负载平衡
    const blocksCount = existingBlocks.filter(b => 
      isSameDay(b.start, date) && b.start.getHours() === hour
    ).length;
    if (blocksCount === 0) {
      score += 10;
      reason = '该时段空闲，有助于平衡工作负载';
      reasonType = 'workload_balance';
    }
    
    suggestions.push({
      id: `suggestion-${index}`,
      start: slot.start,
      end: new Date(slot.start.getTime() + durationMinutes * 60000),
      score: Math.min(100, Math.max(0, score)),
      reason,
      reasonType,
    });
  });
  
  return suggestions.sort((a, b) => b.score - a.score);
}

// 解析Google Calendar事件
export function parseGoogleEvent(event: any): TimeBlock | null {
  try {
    const start = event.start?.dateTime 
      ? parseISO(event.start.dateTime)
      : parseISO(event.start?.date || '');
    const end = event.end?.dateTime
      ? parseISO(event.end.dateTime)
      : parseISO(event.end?.date || '');
    
    if (!isValid(start) || !isValid(end)) return null;
    
    return {
      id: event.id || `google-${Date.now()}`,
      title: event.summary || '无标题',
      start,
      end,
      type: 'event',
      color: event.colorId ? getGoogleEventColor(event.colorId) : '#4285f4',
      description: event.description,
      isDraggable: false,
      source: 'google',
    };
  } catch {
    return null;
  }
}

// Google Calendar 颜色映射
function getGoogleEventColor(colorId: string): string {
  const colorMap: Record<string, string> = {
    '1': '#7986cb', // Lavender
    '2': '#33b679', // Sage
    '3': '#8e24aa', // Grape
    '4': '#e67c73', // Flamingo
    '5': '#f6c026', // Banana
    '6': '#f5511d', // Tangerine
    '7': '#039be5', // Peacock
    '8': '#616161', // Graphite
    '9': '#3f51b5', // Blueberry
    '10': '#0b8043', // Basil
    '11': '#d60000', // Tomato
  };
  return colorMap[colorId] || '#4285f4';
}

// 获取任务时间块颜色
export function getTaskColor(priority?: string): string {
  const colorMap: Record<string, string> = {
    high: '#ef4444',    // red-500
    medium: '#f59e0b',  // amber-500
    low: '#10b981',     // emerald-500
    default: '#3b82f6', // blue-500
  };
  return colorMap[priority || 'default'] || colorMap.default;
}

// 获取空闲时间块颜色
export function getFreeTimeColor(): string {
  return '#d1fae5'; // emerald-100
}

// 计算当前时间在日历上的位置
export function getCurrentTimePosition(date: Date): number {
  const startOfToday = startOfDay(date);
  const minutesPassed = differenceInMinutes(date, startOfToday);
  return (minutesPassed / (24 * 60)) * 100;
}
