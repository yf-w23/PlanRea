"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, isSameDay, differenceInDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Task, PlanMetadata } from "../types";

interface TimelinePreviewProps {
  tasks: Task[];
  metadata: PlanMetadata;
  deadline: Date;
  workingDays: number[];
  weeklyAvailableHours: number;
}

interface TimelineItem extends Task {
  startDay: number;
  endDay: number;
  displayWidth: number;
  displayOffset: number;
}

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

export function TimelinePreview({
  tasks,
  metadata,
  deadline,
  workingDays,
  weeklyAvailableHours,
}: TimelinePreviewProps) {
  const [weekOffset, setWeekOffset] = React.useState(0);

  // 计算时间线数据
  const timelineData = React.useMemo(() => {
    const startDate = new Date(metadata.createdAt);
    const totalDays = Math.ceil(metadata.workingDays * 1.5); // 包含休息日
    const dailyHours = metadata.dailyAverageHours;

    let currentDay = 0;
    const items: TimelineItem[] = tasks.map((task) => {
      const taskDays = Math.max(1, Math.ceil(task.estimatedHours / dailyHours));
      const start = currentDay;
      const end = currentDay + taskDays - 1;
      currentDay = end + 1;

      return {
        ...task,
        startDay: start,
        endDay: end,
        displayWidth: taskDays,
        displayOffset: start,
      };
    });

    return { items, totalDays };
  }, [tasks, metadata]);

  // 计算周数
  const totalWeeks = Math.ceil(timelineData.totalDays / 7);
  const currentWeekStart = weekOffset * 7;
  const currentWeekEnd = Math.min(currentWeekStart + 6, timelineData.totalDays - 1);

  // 获取日期标签
  const getDateLabel = (dayOffset: number) => {
    const baseDate = new Date(metadata.createdAt);
    const date = addDays(baseDate, dayOffset);
    return format(date, "MM/dd");
  };

  // 获取星期标签
  const getWeekDayLabel = (dayOffset: number) => {
    const baseDate = new Date(metadata.createdAt);
    const date = addDays(baseDate, dayOffset);
    return WEEK_DAYS[date.getDay()];
  };

  // 检查是否为工作日
  const isWorkingDay = (dayOffset: number) => {
    const baseDate = new Date(metadata.createdAt);
    const date = addDays(baseDate, dayOffset);
    return workingDays.includes(date.getDay());
  };

  // 过滤当前周显示的任务
  const visibleTasks = timelineData.items.filter(
    (item) =>
      (item.startDay >= currentWeekStart && item.startDay <= currentWeekEnd) ||
      (item.endDay >= currentWeekStart && item.endDay <= currentWeekEnd) ||
      (item.startDay <= currentWeekStart && item.endDay >= currentWeekEnd)
  );

  const canGoPrevious = weekOffset > 0;
  const canGoNext = weekOffset < totalWeeks - 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>时间线预览</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
              disabled={!canGoPrevious}
              className="p-1 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground min-w-[80px] text-center">
              第 {weekOffset + 1}/{totalWeeks} 周
            </span>
            <button
              onClick={() => setWeekOffset((p) => Math.min(totalWeeks - 1, p + 1))}
              disabled={!canGoNext}
              className="p-1 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <CardDescription>
          甘特图样式预览任务时间安排
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              总工时
            </div>
            <p className="text-lg font-semibold">{metadata.totalEstimatedHours}h</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              工作天数
            </div>
            <p className="text-lg font-semibold">{metadata.workingDays}天</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              日均工时
            </div>
            <p className="text-lg font-semibold">{metadata.dailyAverageHours}h</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <BarChart3 className="h-3.5 w-3.5" />
              任务数量
            </div>
            <p className="text-lg font-semibold">{tasks.length}个</p>
          </div>
        </div>

        {/* 甘特图 */}
        <div className="border rounded-lg overflow-hidden">
          {/* 表头 */}
          <div className="grid grid-cols-8 border-b bg-muted/50">
            <div className="p-2 text-xs font-medium border-r">任务</div>
            {Array.from({ length: 7 }, (_, i) => {
              const dayOffset = currentWeekStart + i;
              const isWorkDay = isWorkingDay(dayOffset);
              return (
                <div
                  key={i}
                  className={cn(
                    "p-2 text-center text-xs border-r last:border-r-0",
                    !isWorkDay && "bg-muted"
                  )}
                >
                  <div className="text-muted-foreground">{getWeekDayLabel(dayOffset)}</div>
                  <div className="font-medium">{getDateLabel(dayOffset)}</div>
                </div>
              );
            })}
          </div>

          {/* 任务行 */}
          <div className="divide-y">
            {visibleTasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                本周无任务安排
              </div>
            ) : (
              visibleTasks.map((task) => (
                <div key={task.id} className="grid grid-cols-8 min-h-[48px]">
                  <div className="p-2 border-r text-xs flex items-center">
                    <div className="truncate">
                      <span className="font-medium">#{task.order}</span> {task.title}
                    </div>
                  </div>
                  {Array.from({ length: 7 }, (_, i) => {
                    const dayOffset = currentWeekStart + i;
                    const isWorkDay = isWorkingDay(dayOffset);
                    const isActive = dayOffset >= task.startDay && dayOffset <= task.endDay;
                    const isStart = dayOffset === task.startDay;
                    const isEnd = dayOffset === task.endDay;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "p-1 border-r last:border-r-0 relative",
                          !isWorkDay && "bg-muted/30"
                        )}
                      >
                        {isActive && (
                          <div
                            className={cn(
                              "h-full min-h-[32px] rounded-md flex items-center justify-center text-xs text-white font-medium",
                              PRIORITY_COLORS[task.priority] || "bg-primary"
                            )}
                            style={{ opacity: 0.9 }}
                          >
                            {isStart && task.estimatedHours + "h"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>高优先级</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>中优先级</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>低优先级</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted border" />
            <span>非工作日</span>
          </div>
        </div>

        {/* 截止日期提醒 */}
        <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>截止日期</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {format(new Date(metadata.deadline), "yyyy年MM月dd日", { locale: zhCN })}
            </span>
            <Badge variant="outline" className="text-xs">
              {differenceInDays(new Date(metadata.deadline), new Date()) > 0
                ? `还有 ${differenceInDays(new Date(metadata.deadline), new Date())} 天`
                : "今天截止"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
