"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, CalendarDays, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";

interface PlanConfigFormProps {
  deadline: Date;
  onDeadlineChange: (date: Date) => void;
  weeklyAvailableHours: number;
  onWeeklyHoursChange: (hours: number) => void;
  workingDays: number[];
  onWorkingDaysChange: (days: number[]) => void;
}

const WEEK_DAYS = [
  { id: 1, label: "周一", short: "一" },
  { id: 2, label: "周二", short: "二" },
  { id: 3, label: "周三", short: "三" },
  { id: 4, label: "周四", short: "四" },
  { id: 5, label: "周五", short: "五" },
  { id: 6, label: "周六", short: "六" },
  { id: 0, label: "周日", short: "日" },
];

export function PlanConfigForm({
  deadline,
  onDeadlineChange,
  weeklyAvailableHours,
  onWeeklyHoursChange,
  workingDays,
  onWorkingDaysChange,
}: PlanConfigFormProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const toggleWorkingDay = (dayId: number) => {
    if (workingDays.includes(dayId)) {
      // 至少保留一个工作日
      if (workingDays.length > 1) {
        onWorkingDaysChange(workingDays.filter((d) => d !== dayId));
      }
    } else {
      onWorkingDaysChange([...workingDays, dayId].sort());
    }
  };

  const selectAllWorkingDays = () => {
    onWorkingDaysChange([1, 2, 3, 4, 5, 6, 0]);
  };

  const selectWeekdaysOnly = () => {
    onWorkingDaysChange([1, 2, 3, 4, 5]);
  };

  const dailyAverageHours = Math.round((weeklyAvailableHours / workingDays.length) * 10) / 10;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle>计划配置</CardTitle>
        </div>
        <CardDescription>
          设置截止日期和可用时间，AI将据此生成合理的计划
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 截止日期选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            截止日期
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              className={cn(
                "w-full justify-start text-left font-normal inline-flex items-center h-10 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground",
                !deadline && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? (
                format(deadline, "yyyy年MM月dd日", { locale: zhCN })
              ) : (
                <span>选择日期</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={(date) => {
                  if (date) {
                    onDeadlineChange(date);
                    setCalendarOpen(false);
                  }
                }}
                disabled={(date) => date < addDays(new Date(), -1)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 每周可用时间滑块 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              每周可用时间
            </label>
            <span className="text-sm font-semibold text-primary">
              {weeklyAvailableHours} 小时
            </span>
          </div>
          <Slider
            value={[weeklyAvailableHours]}
            onValueChange={(value) => onWeeklyHoursChange(value[0] ?? 20)}
            min={5}
            max={40}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5h</span>
            <span>10h</span>
            <span>20h</span>
            <span>30h</span>
            <span>40h</span>
          </div>
          <p className="text-xs text-muted-foreground">
            平均每天约 <span className="font-medium text-foreground">{dailyAverageHours} 小时</span>
          </p>
        </div>

        {/* 工作日选择 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              工作日选择
            </label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={selectWeekdaysOnly}
                className="h-6 text-xs"
              >
                仅工作日
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={selectAllWorkingDays}
                className="h-6 text-xs"
              >
                全周
              </Button>
            </div>
          </div>
          <div className="flex gap-1">
            {WEEK_DAYS.map((day) => {
              const isSelected = workingDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleWorkingDay(day.id)}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  title={day.label}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            已选择 <span className="font-medium text-foreground">{workingDays.length}</span> 个工作日
          </p>
        </div>

        {/* 配置摘要 */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-medium">配置摘要</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">截止日期：</span>
              <span>{format(deadline, "MM/dd")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">每周时长：</span>
              <span>{weeklyAvailableHours}h</span>
            </div>
            <div>
              <span className="text-muted-foreground">工作天数：</span>
              <span>{workingDays.length}天</span>
            </div>
            <div>
              <span className="text-muted-foreground">日均时长：</span>
              <span>{dailyAverageHours}h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
