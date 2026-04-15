'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, Clock, ArrowRight, Check, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Conflict,
  TimeBlock,
  formatTime,
  formatDate,
  findAvailableSlots,
} from '../lib/calendar-utils';

interface ConflictResolverProps {
  conflicts: Conflict[];
  timeBlocks: TimeBlock[];
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolution: ConflictResolution) => void;
}

export interface ConflictResolution {
  type: 'move' | 'split' | 'reschedule' | 'ignore';
  blockId: string;
  newStart?: Date;
  newEnd?: Date;
}

export function ConflictResolver({
  conflicts,
  timeBlocks,
  isOpen,
  onClose,
  onResolve,
}: ConflictResolverProps) {
  // 生成解决方案选项
  const generateSolutions = (conflict: Conflict): ConflictSolution[] => {
    const solutions: ConflictSolution[] = [];
    const [blockA, blockB] = conflict.blocks;

    // 方案1: 移动其中一个块
    const movableBlock = blockA.isDraggable ? blockA : blockB.isDraggable ? blockB : null;
    if (movableBlock) {
      const availableSlots = findAvailableSlots(
        movableBlock.start,
        (movableBlock.end.getTime() - movableBlock.start.getTime()) / (1000 * 60),
        timeBlocks.filter(b => b.id !== movableBlock.id)
      );

      availableSlots.slice(0, 3).forEach((slot, index) => {
        solutions.push({
          id: `move-${index}`,
          type: 'move',
          title: `将 "${movableBlock.title}" 移到 ${formatTime(slot.start)}`,
          description: `调整到 ${formatTime(slot.start)} - ${formatTime(slot.end)}`,
          blockId: movableBlock.id,
          newStart: slot.start,
          newEnd: slot.end,
          icon: Calendar,
        });
      });
    }

    // 方案2: 分割时间（如果时长允许）
    if (movableBlock) {
      const duration = (movableBlock.end.getTime() - movableBlock.start.getTime()) / (1000 * 60);
      if (duration > 60) {
        solutions.push({
          id: 'split',
          type: 'split',
          title: `分割 "${movableBlock.title}"`,
          description: '将任务分成两个较短的时间段',
          blockId: movableBlock.id,
          icon: Clock,
        });
      }
    }

    // 方案3: 重新安排到另一天
    const tomorrow = new Date(movableBlock?.start || new Date());
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowSlots = findAvailableSlots(
      tomorrow,
      ((movableBlock?.end.getTime() || 0) - (movableBlock?.start.getTime() || 0)) / (1000 * 60),
      timeBlocks
    );

    if (tomorrowSlots.length > 0 && movableBlock) {
      solutions.push({
        id: 'reschedule',
        type: 'reschedule',
        title: '改期到明天',
        description: `${formatDate(tomorrow)} ${formatTime(tomorrowSlots[0].start)}`,
        blockId: movableBlock.id,
        newStart: tomorrowSlots[0].start,
        newEnd: new Date(tomorrowSlots[0].start.getTime() + 
          (movableBlock.end.getTime() - movableBlock.start.getTime())),
        icon: ArrowRight,
      });
    }

    return solutions;
  };

  if (conflicts.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              无时间冲突
            </DialogTitle>
            <DialogDescription>
              当前日历中没有检测到时间冲突。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            检测到 {conflicts.length} 个时间冲突
          </DialogTitle>
          <DialogDescription>
            以下时间段存在重叠，请选择解决方案：
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {conflicts.map((conflict, index) => (
            <ConflictItem
              key={conflict.id}
              conflict={conflict}
              index={index}
              solutions={generateSolutions(conflict)}
              onResolve={onResolve}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ConflictSolution {
  id: string;
  type: 'move' | 'split' | 'reschedule' | 'ignore';
  title: string;
  description: string;
  blockId: string;
  newStart?: Date;
  newEnd?: Date;
  icon: React.ElementType;
}

interface ConflictItemProps {
  conflict: Conflict;
  index: number;
  solutions: ConflictSolution[];
  onResolve: (resolution: ConflictResolution) => void;
}

function ConflictItem({ conflict, index, solutions, onResolve }: ConflictItemProps) {
  const [blockA, blockB] = conflict.blocks;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-amber-50/50 border-amber-200">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{blockA.title}</span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="font-medium text-sm truncate">{blockB.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            冲突时间: {formatTime(conflict.start)} - {formatTime(conflict.end)}
          </p>
        </div>
      </div>

      <div className="space-y-2 pl-9">
        <p className="text-xs font-medium text-muted-foreground">解决方案:</p>
        {solutions.map(solution => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            onClick={() => onResolve({
              type: solution.type,
              blockId: solution.blockId,
              newStart: solution.newStart,
              newEnd: solution.newEnd,
            })}
          />
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => onResolve({
            type: 'ignore',
            blockId: blockA.id,
          })}
        >
          <X className="w-4 h-4 mr-2" />
          忽略此冲突
        </Button>
      </div>
    </div>
  );
}

function SolutionCard({
  solution,
  onClick,
}: {
  solution: ConflictSolution;
  onClick: () => void;
}) {
  const Icon = solution.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-md border text-left transition-all',
        'hover:border-blue-300 hover:bg-blue-50/50',
        'bg-white border-border'
      )}
    >
      <Icon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{solution.title}</p>
        <p className="text-xs text-muted-foreground">{solution.description}</p>
      </div>
    </button>
  );
}

// 冲突指示器组件
export function ConflictIndicator({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
        'bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors'
      )}
    >
      <AlertTriangle className="w-4 h-4" />
      {count} 个冲突
    </button>
  );
}
