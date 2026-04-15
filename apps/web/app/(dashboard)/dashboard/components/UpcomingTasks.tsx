'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Clock, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '../lib/mock-data';

interface UpcomingTasksProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  onViewAll?: () => void;
}

const priorityConfig = {
  high: {
    label: '高',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  medium: {
    label: '中',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  low: {
    label: '低',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

export function UpcomingTasks({
  tasks,
  onTaskClick,
  onViewAll,
}: UpcomingTasksProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // 只显示前5个未完成的任务
  const upcomingTasks = tasks
    .filter((task) => !task.completed)
    .slice(0, 5);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const today = new Date();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold">即将开始</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={onViewAll}
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 日期标题 */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <span className="text-sm font-medium text-foreground">
            {format(today, 'MM月dd日', { locale: zhCN })}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(today, 'EEEE', { locale: zhCN })}
          </span>
        </div>

        {/* 任务列表 */}
        <div className="space-y-2">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无待办任务</p>
              <p className="text-xs mt-1">享受你的自由时间！</p>
            </div>
          ) : (
            upcomingTasks.map((task, index) => (
              <div
                key={task.id}
                className="group relative"
                onMouseEnter={() => setHoveredTaskId(task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
              >
                <button
                  onClick={() => onTaskClick?.(task.id)}
                  className="w-full text-left"
                >
                  <div
                    className={`
                      relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                      ${hoveredTaskId === task.id ? 'bg-muted shadow-sm' : 'hover:bg-muted/50'}
                    `}
                  >
                    {/* 时间线 */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`
                          w-2.5 h-2.5 rounded-full border-2 transition-colors
                          ${index === 0 ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}
                        `}
                      />
                      {index < upcomingTasks.length - 1 && (
                        <div className="w-px h-full min-h-[24px] bg-border" />
                      )}
                    </div>

                    {/* 任务内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`
                              font-medium truncate transition-colors
                              ${hoveredTaskId === task.id ? 'text-primary' : 'text-foreground'}
                            `}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {task.scheduledTime && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.scheduledTime}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(task.duration)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${priorityConfig[task.priority].className}`}
                          >
                            {priorityConfig[task.priority].label}
                          </Badge>
                          <ArrowRight
                            className={`
                              w-4 h-4 transition-all duration-200
                              ${hoveredTaskId === task.id ? 'opacity-100 translate-x-0 text-primary' : 'opacity-0 -translate-x-2'}
                            `}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        {upcomingTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              还有 {tasks.filter((t) => !t.completed).length - upcomingTasks.length} 个任务待完成
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
