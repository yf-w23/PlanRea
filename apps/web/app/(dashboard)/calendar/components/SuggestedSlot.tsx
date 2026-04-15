'use client';

import React from 'react';
import { Sparkles, Clock, TrendingUp, Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SuggestedSlot as SuggestedSlotType, formatTime, formatDate } from '../lib/calendar-utils';

interface SuggestedSlotsProps {
  suggestions: SuggestedSlotType[];
  onSelect: (slot: SuggestedSlotType) => void;
  taskTitle?: string;
  duration?: number;
}

export function SuggestedSlots({
  suggestions,
  onSelect,
  taskTitle,
  duration,
}: SuggestedSlotsProps) {
  if (suggestions.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无建议时间段</p>
          <p className="text-xs mt-1">请尝试选择其他日期</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium">AI 推荐的时间段</span>
        {taskTitle && (
          <span className="text-xs text-muted-foreground truncate">
            for &quot;{taskTitle}&quot;
          </span>
        )}
      </div>

      <div className="space-y-2">
        {suggestions.slice(0, 5).map((slot, index) => (
          <SuggestedSlotCard
            key={slot.id}
            slot={slot}
            rank={index + 1}
            onSelect={() => onSelect(slot)}
          />
        ))}
      </div>
    </div>
  );
}

interface SuggestedSlotCardProps {
  slot: SuggestedSlotType;
  rank: number;
  onSelect: () => void;
}

function SuggestedSlotCard({ slot, rank, onSelect }: SuggestedSlotCardProps) {
  const getReasonIcon = (reasonType: SuggestedSlotType['reasonType']) => {
    switch (reasonType) {
      case 'optimal':
        return <Star className="w-3 h-3" />;
      case 'workload_balance':
        return <TrendingUp className="w-3 h-3" />;
      case 'preference':
        return <Clock className="w-3 h-3" />;
      case 'deadline':
        return <Calendar className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getReasonColor = (reasonType: SuggestedSlotType['reasonType']) => {
    switch (reasonType) {
      case 'optimal':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'workload_balance':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preference':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deadline':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-blue-300',
        rank === 1 && 'border-amber-300 bg-amber-50/30'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* 排名 */}
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              rank === 1
                ? 'bg-amber-500 text-white'
                : rank === 2
                ? 'bg-gray-400 text-white'
                : rank === 3
                ? 'bg-orange-400 text-white'
                : 'bg-gray-200 text-gray-600'
            )}
          >
            {rank}
          </div>

          {/* 时间信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {formatDate(slot.start)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm">
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </span>
            </div>

            {/* 推荐理由 */}
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5 py-0 h-5 flex items-center gap-1',
                  getReasonColor(slot.reasonType)
                )}
              >
                {getReasonIcon(slot.reasonType)}
                {getReasonLabel(slot.reasonType)}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {slot.reason}
              </span>
            </div>
          </div>

          {/* 评分 */}
          <div className="text-right shrink-0">
            <div
              className={cn(
                'text-lg font-bold',
                slot.score >= 80
                  ? 'text-green-600'
                  : slot.score >= 60
                  ? 'text-amber-600'
                  : 'text-gray-500'
              )}
            >
              {slot.score}
            </div>
            <div className="text-[10px] text-muted-foreground">匹配度</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getReasonLabel(reasonType: SuggestedSlotType['reasonType']): string {
  const labels: Record<SuggestedSlotType['reasonType'], string> = {
    optimal: '最佳',
    workload_balance: '负载平衡',
    preference: '偏好',
    deadline: '截止优先',
  };
  return labels[reasonType];
}

// 简化版建议组件（用于快速选择）
interface QuickSuggestedSlotProps {
  suggestions: SuggestedSlotType[];
  onSelect: (slot: SuggestedSlotType) => void;
}

export function QuickSuggestedSlots({ suggestions, onSelect }: QuickSuggestedSlotProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
      {suggestions.slice(0, 3).map((slot, index) => (
        <Button
          key={slot.id}
          variant="outline"
          size="sm"
          className={cn(
            'shrink-0 h-auto py-1.5 px-3 text-left',
            index === 0 && 'border-amber-300 bg-amber-50'
          )}
          onClick={() => onSelect(slot)}
        >
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">
              {formatTime(slot.start)} - {formatTime(slot.end)}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {slot.reason}
            </span>
          </div>
        </Button>
      ))}
    </div>
  );
}
