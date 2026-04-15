'use client';

import { CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  weeklyGoal?: number;
}

export function ProgressCard({
  completedTasks,
  totalTasks,
  completionRate,
  weeklyGoal = 80,
}: ProgressCardProps) {
  const isGoalMet = completionRate >= weeklyGoal;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-lg font-semibold">本周进度</CardTitle>
          </div>
          {isGoalMet && (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">目标达成</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 完成率大数字 */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">
            {completionRate}
          </span>
          <span className="text-lg text-muted-foreground">%</span>
          <span className="text-sm text-muted-foreground ml-2">已完成</span>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">进度</span>
            <span className="font-medium">{completedTasks}/{totalTasks} 任务</span>
          </div>
          <div className="relative">
            <Progress 
              value={completionRate} 
              className="h-3"
            />
            {/* 目标线标记 */}
            <div
              className="absolute top-0 w-0.5 h-3 bg-emerald-500/50 rounded-full"
              style={{ left: `${weeklyGoal}%` }}
              title={`目标: ${weeklyGoal}%`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-emerald-600 dark:text-emerald-400">目标 {weeklyGoal}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">已完成</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">{totalTasks - completedTasks}</p>
              <p className="text-xs text-muted-foreground">待完成</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
