'use client';

import React, { useRef, useMemo } from 'react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimeBlockList } from './TimeBlock';
import {
  TimeBlock as TimeBlockType,
  ViewType,
  getHoursOfDay,
  formatWeekDay,
  formatShortDate,
  getCurrentTimePosition,
} from '../lib/calendar-utils';

interface CalendarGridProps {
  view: ViewType;
  weekDays: Date[];
  timeBlocks: TimeBlockType[];
  currentDate: Date;
  conflictBlockIds?: Set<string>;
  onMoveBlock?: (id: string, newStart: Date, newEnd: Date) => void;
  onBlockClick?: (block: TimeBlockType) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

const HOUR_HEIGHT = 60; // 每小时的高度（像素）
const TOTAL_HOURS = 24;

export function CalendarGrid({
  view,
  weekDays,
  timeBlocks,
  currentDate,
  conflictBlockIds = new Set(),
  onMoveBlock,
  onBlockClick,
  onTimeSlotClick,
}: CalendarGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerHeight = TOTAL_HOURS * HOUR_HEIGHT;

  // 获取当前时间线位置
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    if (!weekDays.some(day => isSameDay(day, now))) return null;
    return (getCurrentTimePosition(now) / 100) * containerHeight;
  }, [weekDays, containerHeight]);

  // 过滤特定日期的时间块
  const getBlocksForDay = (day: Date): TimeBlockType[] => {
    return timeBlocks.filter(block => isSameDay(block.start, day));
  };

  // 小时标签
  const renderHourLabels = () => (
    <div className="flex flex-col w-16 shrink-0 border-r border-border bg-muted/30">
      <div className="h-12 border-b border-border shrink-0" /> {/* Header spacer */}
      {getHoursOfDay().map(hour => (
        <div
          key={hour}
          className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
          style={{ height: `${HOUR_HEIGHT}px` }}
        >
          <span className="-translate-y-1/2">
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </span>
        </div>
      ))}
    </div>
  );

  // 日期头部
  const renderDayHeader = (day: Date) => {
    const isToday = isSameDay(day, new Date());
    const isSelected = isSameDay(day, currentDate);

    return (
      <div
        key={day.toISOString()}
        className={cn(
          'flex flex-col items-center justify-center py-2 border-b border-r border-border',
          isToday && 'bg-blue-50/50',
          isSelected && 'bg-blue-100/50'
        )}
      >
        <span className={cn(
          'text-xs font-medium uppercase',
          isToday ? 'text-blue-600' : 'text-muted-foreground'
        )}>
          {formatWeekDay(day)}
        </span>
        <span className={cn(
          'text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full mt-1',
          isToday && 'bg-blue-600 text-white',
          !isToday && isSelected && 'bg-blue-100 text-blue-700'
        )}>
          {format(day, 'd')}
        </span>
      </div>
    );
  };

  // 时间网格单元格
  const renderTimeCell = (day: Date, hour: number) => (
    <div
      key={`${day.toISOString()}-${hour}`}
      className={cn(
        'border-b border-r border-border hover:bg-muted/50 transition-colors',
        hour % 2 === 0 ? 'bg-background' : 'bg-muted/20'
      )}
      style={{ height: `${HOUR_HEIGHT}px` }}
      onClick={() => onTimeSlotClick?.(day, hour)}
    />
  );

  // 渲染当前时间指示线
  const renderCurrentTimeIndicator = () => {
    if (currentTimePosition === null) return null;
    
    return (
      <div
        className="absolute left-0 right-0 pointer-events-none z-20"
        style={{ top: `${currentTimePosition}px` }}
      >
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
          <div className="flex-1 h-px bg-red-500" />
        </div>
      </div>
    );
  };

  // 渲染日视图
  if (view === 'day') {
    const day = weekDays[0] || currentDate;
    const dayBlocks = getBlocksForDay(day);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex border-b border-border">
          <div className="w-16 shrink-0" /> {/* Time label spacer */}
          {renderDayHeader(day)}
        </div>
        <div className="flex-1 overflow-auto" ref={containerRef}>
          <div className="flex min-h-fit">
            {renderHourLabels()}
            <div className="flex-1 relative">
              {/* Time grid background */}
              <div className="flex flex-col">
                {getHoursOfDay().map(hour => renderTimeCell(day, hour))}
              </div>
              
              {/* Current time indicator */}
              {renderCurrentTimeIndicator()}
              
              {/* Time blocks */}
              <div className="absolute inset-0">
                <TimeBlockList
                  blocks={dayBlocks}
                  dayStart={startOfDay(day)}
                  containerHeight={containerHeight}
                  onMoveBlock={onMoveBlock}
                  onBlockClick={onBlockClick}
                  conflictBlockIds={conflictBlockIds}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染周视图
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header row */}
      <div className="flex border-b border-border shrink-0">
        <div className="w-16 shrink-0" /> {/* Time label spacer */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map(day => renderDayHeader(day))}
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <div className="flex min-h-fit">
          {renderHourLabels()}
          <div className="flex-1 grid grid-cols-7 relative">
            {/* Time grid background */}
            {weekDays.map(day => (
              <div key={day.toISOString()} className="flex flex-col">
                {getHoursOfDay().map(hour => renderTimeCell(day, hour))}
              </div>
            ))}

            {/* Current time indicator */}
            {renderCurrentTimeIndicator()}

            {/* Time blocks overlay */}
            {weekDays.map((day, index) => {
              const dayBlocks = getBlocksForDay(day);
              const dayStart = startOfDay(day);
              
              return (
                <div
                  key={`blocks-${day.toISOString()}`}
                  className="relative"
                  style={{
                    position: 'absolute',
                    left: `${(index / 7) * 100}%`,
                    width: `${100 / 7}%`,
                    top: 0,
                    height: `${containerHeight}px`,
                  }}
                >
                  <TimeBlockList
                    blocks={dayBlocks}
                    dayStart={dayStart}
                    containerHeight={containerHeight}
                    onMoveBlock={onMoveBlock}
                    onBlockClick={onBlockClick}
                    conflictBlockIds={conflictBlockIds}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 月视图简化版
export function MonthView({
  currentDate,
  timeBlocks,
  onBlockClick,
}: {
  currentDate: Date;
  timeBlocks: TimeBlockType[];
  onBlockClick?: (block: TimeBlockType) => void;
}) {
  // 简化的月视图 - 实际实现需要完整的日历逻辑
  return (
    <div className="p-4">
      <div className="text-center text-muted-foreground">
        月视图开发中 - 请使用周视图或日视图
      </div>
    </div>
  );
}
