"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ProgressBarProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  variant?: "linear" | "circular";
  showPercentage?: boolean;
  className?: string;
  color?: string;
}

// 线性进度条
function LinearProgress({
  progress,
  size = "md",
  showPercentage = true,
  className,
  color,
}: Omit<ProgressBarProps, "variant">) {
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const getColorClass = () => {
    if (color) return color;
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn("h-full rounded-full transition-colors", getColorClass())}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.span
          className="mt-1 text-xs text-muted-foreground block text-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
}

// 圆形进度条
function CircularProgress({
  progress,
  size = "md",
  showPercentage = true,
  className,
  color,
}: Omit<ProgressBarProps, "variant">) {
  const sizeMap = {
    sm: { width: 48, stroke: 4 },
    md: { width: 64, stroke: 6 },
    lg: { width: 96, stroke: 8 },
  };

  const { width, stroke } = sizeMap[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColorClass = () => {
    if (color) return color;
    if (progress >= 80) return "text-emerald-500";
    if (progress >= 50) return "text-amber-500";
    return "text-primary";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="-rotate-90"
      >
        {/* 背景圆环 */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-muted"
          stroke="currentColor"
        />
        {/* 进度圆环 */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn("transition-colors", getColorClass())}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      {showPercentage && (
        <motion.span
          className={cn(
            "absolute font-semibold",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
}

// 迷你进度指示器（用于列表项）
export function MiniProgress({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  const getColorClass = () => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", getColorClass())}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
    </div>
  );
}

// 任务统计进度卡片
export function TaskStatsProgress({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <CircularProgress progress={progress} size="sm" showPercentage={false} />
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {completed}/{total}
        </span>
        <span className="text-xs text-muted-foreground">已完成</span>
      </div>
    </div>
  );
}

// 主导出组件
export function ProgressBar({
  progress,
  size = "md",
  variant = "linear",
  showPercentage = true,
  className,
  color,
}: ProgressBarProps) {
  if (variant === "circular") {
    return (
      <CircularProgress
        progress={progress}
        size={size}
        showPercentage={showPercentage}
        className={className}
        color={color}
      />
    );
  }

  return (
    <LinearProgress
      progress={progress}
      size={size}
      showPercentage={showPercentage}
      className={className}
      color={color}
    />
  );
}
