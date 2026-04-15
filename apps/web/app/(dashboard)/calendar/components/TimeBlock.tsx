'use client';

import React, { useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { GripVertical, Clock, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeBlock as TimeBlockType, formatTime } from '../lib/calendar-utils';

interface TimeBlockProps {
  block: TimeBlockType;
  dayStart: Date;
  containerHeight: number;
  onMove?: (id: string, newStart: Date, newEnd: Date) => void;
  onClick?: (block: TimeBlockType) => void;
  hasConflict?: boolean;
}

export function TimeBlock({
  block,
  dayStart,
  containerHeight,
  onMove,
  onClick,
  hasConflict = false,
}: TimeBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // 计算位置
  const startMinutes = (block.start.getHours() * 60 + block.start.getMinutes());
  const durationMinutes = (block.end.getTime() - block.start.getTime()) / (1000 * 60);
  const top = (startMinutes / (24 * 60)) * containerHeight;
  const height = (durationMinutes / (24 * 60)) * containerHeight;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!block.isDraggable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [block.isDraggable]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !blockRef.current) return;
    
    const deltaY = e.clientY - startPosRef.current.y;
    blockRef.current.style.transform = `translateY(${deltaY}px)`;
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging || !onMove) return;
    
    const deltaY = e.clientY - startPosRef.current.y;
    const deltaMinutes = Math.round((deltaY / containerHeight) * 24 * 60 / 15) * 15;
    
    const newStart = new Date(block.start.getTime() + deltaMinutes * 60000);
    const newEnd = new Date(block.end.getTime() + deltaMinutes * 60000);
    
    // 确保不跨天
    if (newStart.getDate() === block.start.getDate()) {
      onMove(block.id, newStart, newEnd);
    }
    
    setIsDragging(false);
    if (blockRef.current) {
      blockRef.current.style.transform = '';
    }
  }, [isDragging, block, containerHeight, onMove]);

  // 添加全局事件监听
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getBlockStyles = () => {
    const baseStyles = 'absolute left-0 right-0 rounded-md px-2 py-1 text-xs overflow-hidden cursor-pointer transition-shadow';
    
    switch (block.type) {
      case 'task':
        return cn(
          baseStyles,
          'bg-blue-500 text-white border-l-4 border-blue-700',
          block.isDraggable && 'hover:shadow-lg hover:z-10',
          hasConflict && 'ring-2 ring-red-500 ring-offset-1'
        );
      case 'event':
        return cn(
          baseStyles,
          'opacity-90',
          hasConflict && 'ring-2 ring-red-500 ring-offset-1'
        );
      case 'free':
        return cn(
          baseStyles,
          'bg-emerald-100 text-emerald-800 border border-emerald-300'
        );
      default:
        return baseStyles;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(block);
  };

  return (
    <div
      ref={blockRef}
      className={getBlockStyles()}
      style={{
        top: `${top}px`,
        height: `${Math.max(height - 2, 20)}px`,
        backgroundColor: block.type === 'event' ? block.color : undefined,
        zIndex: isDragging ? 50 : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1 h-full">
        {block.isDraggable && (
          <GripVertical className="w-3 h-3 opacity-50 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{block.title}</div>
          {height > 30 && (
            <div className="flex items-center gap-1 text-[10px] opacity-80">
              <Clock className="w-3 h-3" />
              <span>
                {formatTime(block.start)} - {formatTime(block.end)}
              </span>
            </div>
          )}
        </div>
        {hasConflict && (
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        )}
        {block.source === 'google' && (
          <Calendar className="w-3 h-3 opacity-60 shrink-0" />
        )}
      </div>
    </div>
  );
}

// 时间块列表组件
interface TimeBlockListProps {
  blocks: TimeBlockType[];
  dayStart: Date;
  containerHeight: number;
  onMoveBlock?: (id: string, newStart: Date, newEnd: Date) => void;
  onBlockClick?: (block: TimeBlockType) => void;
  conflictBlockIds?: Set<string>;
}

export function TimeBlockList({
  blocks,
  dayStart,
  containerHeight,
  onMoveBlock,
  onBlockClick,
  conflictBlockIds = new Set(),
}: TimeBlockListProps) {
  return (
    <>
      {blocks.map(block => (
        <TimeBlock
          key={block.id}
          block={block}
          dayStart={dayStart}
          containerHeight={containerHeight}
          onMove={onMoveBlock}
          onClick={onBlockClick}
          hasConflict={conflictBlockIds.has(block.id)}
        />
      ))}
    </>
  );
}
