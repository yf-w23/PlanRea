'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from 'date-fns';
import {
  ViewType,
  TimeBlock,
  Conflict,
  SuggestedSlot,
  getWeekDays,
  detectConflicts,
  generateSuggestedSlots,
  parseGoogleEvent,
} from '../lib/calendar-utils';

interface UseCalendarOptions {
  initialView?: ViewType;
  initialDate?: Date;
  googleCalendarEnabled?: boolean;
}

interface UseCalendarReturn {
  // 视图状态
  view: ViewType;
  setView: (view: ViewType) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  
  // 导航
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  
  // 日期范围
  viewStart: Date;
  viewEnd: Date;
  weekDays: Date[];
  
  // 事件
  timeBlocks: TimeBlock[];
  setTimeBlocks: (blocks: TimeBlock[]) => void;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  moveTimeBlock: (id: string, newStart: Date, newEnd: Date) => void;
  
  // Google Calendar
  googleEvents: TimeBlock[];
  isLoadingGoogle: boolean;
  refreshGoogleEvents: () => Promise<void>;
  
  // 冲突检测
  conflicts: Conflict[];
  
  // 建议时间段
  suggestedSlots: SuggestedSlot[];
  generateSuggestions: (date: Date, durationMinutes: number) => void;
  
  // 选中状态
  selectedBlock: TimeBlock | null;
  setSelectedBlock: (block: TimeBlock | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const {
    initialView = 'week',
    initialDate = new Date(),
    googleCalendarEnabled = true,
  } = options;

  const [view, setView] = useState<ViewType>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [googleEvents, setGoogleEvents] = useState<TimeBlock[]>([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<SuggestedSlot[]>([]);

  // 计算视图日期范围
  const { viewStart, viewEnd, weekDays } = useMemo(() => {
    let start: Date;
    let end: Date;
    let days: Date[] = [];

    switch (view) {
      case 'day':
        start = currentDate;
        end = currentDate;
        days = [currentDate];
        break;
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        days = getWeekDays(currentDate);
        break;
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        days = getWeekDays(currentDate); // 简化为周视图
        break;
      default:
        start = currentDate;
        end = currentDate;
        days = [currentDate];
    }

    return { viewStart: start, viewEnd: end, weekDays: days };
  }, [view, currentDate]);

  // 导航函数
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  }, [view]);

  const goToNext = useCallback(() => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  }, [view]);

  // 时间块操作
  const addTimeBlock = useCallback((block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setTimeBlocks(prev => [...prev, newBlock]);
  }, []);

  const updateTimeBlock = useCallback((id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks(prev =>
      prev.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  }, []);

  const deleteTimeBlock = useCallback((id: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const moveTimeBlock = useCallback((id: string, newStart: Date, newEnd: Date) => {
    setTimeBlocks(prev =>
      prev.map(block =>
        block.id === id ? { ...block, start: newStart, end: newEnd } : block
      )
    );
  }, []);

  // Google Calendar 集成
  const refreshGoogleEvents = useCallback(async () => {
    if (!googleCalendarEnabled) return;

    setIsLoadingGoogle(true);
    try {
      // TODO: 替换为实际的 Google Calendar API 调用
      // const response = await fetch(`/api/calendar/google?timeMin=${viewStart.toISOString()}&timeMax=${viewEnd.toISOString()}`);
      // const data = await response.json();
      
      // 模拟数据
      const mockEvents: TimeBlock[] = [
        {
          id: 'google-1',
          title: '团队周会',
          start: new Date(new Date().setHours(10, 0, 0, 0)),
          end: new Date(new Date().setHours(11, 0, 0, 0)),
          type: 'event',
          color: '#4285f4',
          isDraggable: false,
          source: 'google',
        },
        {
          id: 'google-2',
          title: '项目评审',
          start: new Date(new Date().setHours(14, 0, 0, 0)),
          end: new Date(new Date().setHours(15, 30, 0, 0)),
          type: 'event',
          color: '#34a853',
          isDraggable: false,
          source: 'google',
        },
      ];
      
      setGoogleEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
    } finally {
      setIsLoadingGoogle(false);
    }
  }, [googleCalendarEnabled, viewStart, viewEnd]);

  // 初始加载 Google Calendar 事件
  useEffect(() => {
    refreshGoogleEvents();
  }, [refreshGoogleEvents]);

  // 合并本地和 Google Calendar 事件
  const allBlocks = useMemo(() => {
    return [...timeBlocks, ...googleEvents];
  }, [timeBlocks, googleEvents]);

  // 冲突检测
  const conflicts = useMemo(() => {
    return detectConflicts(allBlocks);
  }, [allBlocks]);

  // 生成建议时间段
  const generateSuggestions = useCallback((date: Date, durationMinutes: number) => {
    const suggestions = generateSuggestedSlots(date, durationMinutes, allBlocks);
    setSuggestedSlots(suggestions);
  }, [allBlocks]);

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    goToToday,
    goToPrevious,
    goToNext,
    viewStart,
    viewEnd,
    weekDays,
    timeBlocks,
    setTimeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    moveTimeBlock,
    googleEvents,
    isLoadingGoogle,
    refreshGoogleEvents,
    conflicts,
    suggestedSlots,
    generateSuggestions,
    selectedBlock,
    setSelectedBlock,
    isModalOpen,
    setIsModalOpen,
  };
}
