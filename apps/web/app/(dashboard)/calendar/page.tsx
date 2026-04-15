'use client';

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Grid3X3, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarGrid, MonthView } from './components/CalendarGrid';
import { ConflictResolver, ConflictResolution, ConflictIndicator } from './components/ConflictResolver';
import { EventModal } from './components/EventModal';
import { useCalendar } from './hooks/useCalendar';
import { ViewType, TimeBlock, SuggestedSlot, formatMonthYear, formatShortDate } from './lib/calendar-utils';

export default function CalendarPage() {
  const {
    view,
    setView,
    currentDate,
    weekDays,
    goToToday,
    goToPrevious,
    goToNext,
    timeBlocks,
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
  } = useCalendar({
    initialView: 'week',
    googleCalendarEnabled: true,
  });

  const [isConflictResolverOpen, setIsConflictResolverOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<Date | undefined>();

  // 合并所有时间块
  const allBlocks = [...timeBlocks, ...googleEvents];

  // 获取有冲突的块ID
  const conflictBlockIds = new Set(
    conflicts.flatMap(c => c.blocks.map(b => b.id))
  );

  // 处理时间块点击
  const handleBlockClick = useCallback((block: TimeBlock) => {
    setSelectedBlock(block);
    setSelectedDateForNewEvent(undefined);
    setIsModalOpen(true);
  }, [setSelectedBlock, setIsModalOpen]);

  // 处理时间槽点击（新建事件）
  const handleTimeSlotClick = useCallback((date: Date, hour: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour, 0, 0, 0);
    setSelectedDateForNewEvent(newDate);
    setSelectedBlock(null);
    setIsModalOpen(true);
  }, []);

  // 处理添加/更新事件
  const handleSaveEvent = useCallback((block: Omit<TimeBlock, 'id'> & { id?: string }) => {
    if (block.id) {
      updateTimeBlock(block.id, block);
    } else {
      addTimeBlock(block);
    }
  }, [addTimeBlock, updateTimeBlock]);

  // 处理删除事件
  const handleDeleteEvent = useCallback((id: string) => {
    deleteTimeBlock(id);
  }, [deleteTimeBlock]);

  // 处理时间块移动
  const handleMoveBlock = useCallback((id: string, newStart: Date, newEnd: Date) => {
    moveTimeBlock(id, newStart, newEnd);
  }, [moveTimeBlock]);

  // 处理冲突解决
  const handleResolveConflict = useCallback((resolution: ConflictResolution) => {
    switch (resolution.type) {
      case 'move':
      case 'reschedule':
        if (resolution.newStart && resolution.newEnd) {
          moveTimeBlock(resolution.blockId, resolution.newStart, resolution.newEnd);
        }
        break;
      case 'split':
        // TODO: 实现分割逻辑
        break;
      case 'ignore':
        // 不做任何操作
        break;
    }
  }, [moveTimeBlock]);

  // 视图切换按钮
  const ViewToggle = () => (
    <ButtonGroup>
      <Button
        variant={view === 'day' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setView('day')}
        className="gap-1"
      >
        <Clock className="w-4 h-4" />
        日
      </Button>
      <Button
        variant={view === 'week' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setView('week')}
        className="gap-1"
      >
        <Calendar className="w-4 h-4" />
        周
      </Button>
      <Button
        variant={view === 'month' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setView('month')}
        className="gap-1"
      >
        <Grid3X3 className="w-4 h-4" />
        月
      </Button>
    </ButtonGroup>
  );

  // 日期范围显示
  const DateRangeDisplay = () => {
    if (view === 'day') {
      return (
        <span className="text-lg font-semibold">
          {format(currentDate, 'yyyy年MM月dd日')}
        </span>
      );
    }
    
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return (
        <span className="text-lg font-semibold">
          {format(start, 'MM月dd日')} - {format(end, 'MM月dd日')}
        </span>
      );
    }

    return (
      <span className="text-lg font-semibold">
        {formatMonthYear(currentDate)}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="border-b rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                今天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-4">
                <DateRangeDisplay />
              </div>
            </div>

            {/* Center: View Toggle */}
            <ViewToggle />

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ConflictIndicator
                count={conflicts.length}
                onClick={() => setIsConflictResolverOpen(true)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={refreshGoogleEvents}
                disabled={isLoadingGoogle}
                className="gap-1"
              >
                <RefreshCw className={cn('w-4 h-4', isLoadingGoogle && 'animate-spin')} />
                同步 Google
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDateForNewEvent(new Date());
                  setSelectedBlock(null);
                  setIsModalOpen(true);
                }}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                新建
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'month' ? (
          <MonthView
            currentDate={currentDate}
            timeBlocks={allBlocks}
            onBlockClick={handleBlockClick}
          />
        ) : (
          <CalendarGrid
            view={view}
            weekDays={weekDays}
            timeBlocks={allBlocks}
            currentDate={currentDate}
            conflictBlockIds={conflictBlockIds}
            onMoveBlock={handleMoveBlock}
            onBlockClick={handleBlockClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        block={selectedBlock}
        selectedDate={selectedDateForNewEvent}
        suggestedSlots={suggestedSlots}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onGenerateSuggestions={generateSuggestions}
      />

      {/* Conflict Resolver */}
      <ConflictResolver
        conflicts={conflicts}
        timeBlocks={timeBlocks}
        isOpen={isConflictResolverOpen}
        onClose={() => setIsConflictResolverOpen(false)}
        onResolve={handleResolveConflict}
      />
    </div>
  );
}
