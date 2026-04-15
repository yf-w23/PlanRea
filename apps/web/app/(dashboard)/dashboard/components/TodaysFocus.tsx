'use client';

import { Play, Clock, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, getAIPrompt } from '../lib/mock-data';

interface TodaysFocusProps {
  task: Task;
  currentEnergyLevel?: number;
  onStart?: (taskId: string) => void;
}

export function TodaysFocus({
  task,
  currentEnergyLevel = 85,
  onStart,
}: TodaysFocusProps) {
  const aiPrompt = getAIPrompt(currentEnergyLevel);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
    }
    return `${mins}分钟`;
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-muted/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">今日专注</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            最重要
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* AI 提示语 */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{aiPrompt}</p>
        </div>

        {/* 任务信息 */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {task.scheduledTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{task.scheduledTime}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(task.duration)}</span>
            </div>
            {task.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{task.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 开始按钮 */}
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => onStart?.(task.id)}
        >
          <Play className="w-4 h-4" />
          开始专注
        </Button>
      </CardContent>
    </Card>
  );
}
