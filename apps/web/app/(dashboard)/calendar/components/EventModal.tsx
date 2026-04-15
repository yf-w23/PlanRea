'use client';

import React, { useState, useEffect } from 'react';
import { format, parse, setHours, setMinutes, addMinutes } from 'date-fns';
import { Calendar, Clock, X, Trash2, Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeBlock, TimeBlockType, SuggestedSlot, formatDate, formatTime } from '../lib/calendar-utils';
import { SuggestedSlots } from './SuggestedSlot';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: TimeBlock | null;
  selectedDate?: Date;
  suggestedSlots: SuggestedSlot[];
  onSave: (block: Omit<TimeBlock, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onGenerateSuggestions: (date: Date, durationMinutes: number) => void;
}

const DURATION_OPTIONS = [
  { value: '15', label: '15 分钟' },
  { value: '30', label: '30 分钟' },
  { value: '45', label: '45 分钟' },
  { value: '60', label: '1 小时' },
  { value: '90', label: '1.5 小时' },
  { value: '120', label: '2 小时' },
  { value: '180', label: '3 小时' },
];

export function EventModal({
  isOpen,
  onClose,
  block,
  selectedDate,
  suggestedSlots,
  onSave,
  onDelete,
  onGenerateSuggestions,
}: EventModalProps) {
  const isEditing = !!block;
  const isGoogleEvent = block?.source === 'google';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState<TimeBlockType>('task');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      if (block) {
        setTitle(block.title);
        setDescription(block.description || '');
        setDate(formatDate(block.start, 'yyyy-MM-dd'));
        setStartTime(formatTime(block.start));
        const durationMinutes = Math.round(
          (block.end.getTime() - block.start.getTime()) / (1000 * 60)
        );
        setDuration(String(durationMinutes));
        setType(block.type);
        setShowSuggestions(false);
      } else if (selectedDate) {
        setTitle('');
        setDescription('');
        setDate(formatDate(selectedDate, 'yyyy-MM-dd'));
        setStartTime('09:00');
        setDuration('60');
        setType('task');
        setShowSuggestions(true);
        // 生成建议
        onGenerateSuggestions(selectedDate, 60);
      }
    }
  }, [isOpen, block, selectedDate, onGenerateSuggestions]);

  const handleSave = () => {
    const startDateTime = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = addMinutes(startDateTime, parseInt(duration));

    const savedBlock: Omit<TimeBlock, 'id'> & { id?: string } = {
      id: block?.id,
      title: title || '未命名事件',
      start: startDateTime,
      end: endDateTime,
      type,
      description,
      isDraggable: type === 'task',
      source: 'local',
      color: type === 'task' ? '#3b82f6' : type === 'free' ? '#10b981' : undefined,
    };

    onSave(savedBlock);
    onClose();
  };

  const handleDelete = () => {
    if (block && onDelete) {
      onDelete(block.id);
      onClose();
    }
  };

  const handleSuggestionSelect = (slot: SuggestedSlot) => {
    setDate(formatDate(slot.start, 'yyyy-MM-dd'));
    setStartTime(formatTime(slot.start));
    const durationMinutes = Math.round(
      (slot.end.getTime() - slot.start.getTime()) / (1000 * 60)
    );
    setDuration(String(durationMinutes));
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    if (date) {
      const selectedDate = parse(date, 'yyyy-MM-dd', new Date());
      onGenerateSuggestions(selectedDate, parseInt(value));
    }
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    const newDate = parse(value, 'yyyy-MM-dd', new Date());
    onGenerateSuggestions(newDate, parseInt(duration));
  };

  if (isGoogleEvent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Google Calendar 事件
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">标题</Label>
              <p className="font-medium text-lg">{block?.title}</p>
            </div>
            
            {block?.description && (
              <div>
                <Label className="text-muted-foreground">描述</Label>
                <p className="text-sm">{block.description}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-muted-foreground">开始</Label>
                <p className="font-medium">{block && formatTime(block.start)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">结束</Label>
                <p className="font-medium">{block && formatTime(block.end)}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                此事件来自 Google Calendar，只能在 Google Calendar 中编辑。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '编辑时间块' : '添加时间块'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="输入标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 类型选择 */}
          <div className="space-y-2">
            <Label>类型</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'task' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('task')}
                className="flex-1"
              >
                任务
              </Button>
              <Button
                type="button"
                variant={type === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('free')}
                className="flex-1"
              >
                空闲
              </Button>
            </div>
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">开始时间</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* 时长 */}
          <div className="space-y-2">
            <Label>时长</Label>
            <Select value={duration} onValueChange={handleDurationChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="添加描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* AI 建议 */}
          {!isEditing && showSuggestions && suggestedSlots.length > 0 && (
            <div className="pt-2">
              <SuggestedSlots
                suggestions={suggestedSlots}
                onSelect={handleSuggestionSelect}
                taskTitle={title}
                duration={parseInt(duration)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              删除
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
