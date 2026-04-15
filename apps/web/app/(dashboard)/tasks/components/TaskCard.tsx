"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
  Clock8,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, Priority } from "../types";
import { MiniProgress } from "./ProgressBar";

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onDefer?: (id: string) => void;
  onClick?: (task: Task) => void;
  className?: string;
}

// 优先级配置
const priorityConfig: Record<
  Priority,
  { label: string; color: string; bgColor: string; icon: typeof AlertCircle }
> = {
  high: {
    label: "高优先级",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    icon: AlertCircle,
  },
  medium: {
    label: "中优先级",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    icon: AlertCircle,
  },
  low: {
    label: "低优先级",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: AlertCircle,
  },
};

// 格式化预计时间
function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${remainingMinutes}分钟`;
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "今天";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "明天";
  }

  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

// 检查是否逾期
function isOverdue(dateString: string, status: string): boolean {
  if (status === "completed") return false;
  return new Date(dateString) < new Date();
}

// 计算子任务完成进度
function calculateSubTaskProgress(task: Task): number {
  if (task.subTasks.length === 0) return 0;
  const completed = task.subTasks.filter((st) => st.completed).length;
  return Math.round((completed / task.subTasks.length) * 100);
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDefer,
  onClick,
  className,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;
  const subTaskProgress = calculateSubTaskProgress(task);
  const hasSubTasks = task.subTasks.length > 0;

  const isCompleted = task.status === "completed";
  const isDeferred = task.status === "deferred";
  const overdue = task.dueDate ? isOverdue(task.dueDate, task.status) : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.005 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative p-4 rounded-xl border bg-card transition-all cursor-pointer",
        "hover:shadow-md hover:border-primary/20",
        isCompleted && "opacity-75 bg-muted/50",
        isDeferred && "opacity-60",
        className
      )}
      onClick={() => onClick?.(task)}
    >
      <div className="flex items-start gap-3">
        {/* 复选框 */}
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "shrink-0 mt-0.5 rounded-full",
            isCompleted
              ? "text-emerald-500 hover:text-emerald-600"
              : "text-muted-foreground hover:text-primary"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(task.id);
          }}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </Button>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-medium text-foreground leading-tight line-clamp-2",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent shrink-0 opacity-0 transition-opacity",
                  (isHovered || isDeferred) && "opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(task);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                {!isDeferred && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDefer?.(task.id);
                    }}
                  >
                    <Clock8 className="w-4 h-4 mr-2" />
                    推迟
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(task.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 描述 */}
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* 标签行 */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* 优先级标签 */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-normal",
                priority.bgColor,
                priority.color,
                "border-0"
              )}
            >
              <PriorityIcon className="w-3 h-3 mr-1" />
              {priority.label}
            </Badge>

            {/* 预计时间 */}
            <Badge variant="secondary" className="text-xs font-normal">
              <Clock className="w-3 h-3 mr-1" />
              {formatEstimatedTime(task.estimatedMinutes)}
            </Badge>

            {/* 截止日期 */}
            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-normal",
                  overdue
                    ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400"
                    : "text-muted-foreground"
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {overdue ? "已逾期" : formatDate(task.dueDate)}
              </Badge>
            )}

            {/* 所属计划 */}
            {task.plan && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                <Folder className="w-3 h-3 mr-1" />
                {task.plan.title}
              </Badge>
            )}

            {/* 状态标签 */}
            {isDeferred && (
              <Badge
                variant="outline"
                className="text-xs font-normal bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400"
              >
                <Clock8 className="w-3 h-3 mr-1" />
                已推迟
              </Badge>
            )}
          </div>

          {/* 子任务进度 */}
          {hasSubTasks && !isCompleted && (
            <div className="mt-3">
              <MiniProgress progress={subTaskProgress} />
              <p className="mt-1 text-xs text-muted-foreground">
                {task.subTasks.filter((st) => st.completed).length}/{task.subTasks.length} 个子任务完成
              </p>
            </div>
          )}
        </div>

        {/* 右侧操作区（悬停显示） */}
        {!isCompleted && !isDeferred && (
          <div
            className={cn(
              "shrink-0 flex flex-col gap-1 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 简化版任务卡片（用于小空间展示）
export function TaskCardCompact({
  task,
  onToggleComplete,
  onClick,
  className,
}: Pick<TaskCardProps, "task" | "onToggleComplete" | "onClick" | "className">) {
  const priority = priorityConfig[task.priority];
  const isCompleted = task.status === "completed";
  const isDeferred = task.status === "deferred";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        "hover:bg-muted/50 transition-colors cursor-pointer",
        isCompleted && "opacity-60",
        isDeferred && "opacity-50",
        className
      )}
      onClick={() => onClick?.(task)}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        className={cn(
          "shrink-0 rounded-full",
          isCompleted ? "text-emerald-500" : "text-muted-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete?.(task.id);
        }}
      >
        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCompleted && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-xs", priority.color)}>{priority.label}</span>
          <span className="text-xs text-muted-foreground">
            {formatEstimatedTime(task.estimatedMinutes)}
          </span>
        </div>
      </div>

      {!isCompleted && task.status === "in_progress" && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
}
