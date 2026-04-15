"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Check, ArrowRight, Sparkles, Brain, Clock, ListTodo, Route } from "lucide-react";
import { cn } from "@/lib/utils";

export type GenerationStep = {
  id: string;
  label: string;
  status: "pending" | "loading" | "completed";
  icon?: React.ReactNode;
};

interface AIGeneratingStateProps {
  steps: GenerationStep[];
  currentStepIndex: number;
  progress?: number;
}

const DEFAULT_STEPS: GenerationStep[] = [
  {
    id: "analyzing",
    label: "分析目标...",
    status: "loading",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    id: "identifying",
    label: "识别主要任务",
    status: "pending",
    icon: <ListTodo className="h-4 w-4" />,
  },
  {
    id: "estimating",
    label: "估算时间需求",
    status: "pending",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: "optimizing",
    label: "优化任务顺序...",
    status: "pending",
    icon: <Route className="h-4 w-4" />,
  },
];

function StepIcon({ status, icon }: { status: GenerationStep["status"]; icon?: React.ReactNode }) {
  if (status === "completed") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-600">
        <Check className="h-3.5 w-3.5" />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
      {icon || <div className="h-2 w-2 rounded-full bg-current" />}
    </div>
  );
}

function StepConnector({ status }: { status: GenerationStep["status"] }) {
  return (
    <div className="ml-3 h-6 w-px">
      <div
        className={cn(
          "h-full w-px transition-colors",
          status === "completed" ? "bg-green-500/50" : "bg-border"
        )}
      />
    </div>
  );
}

export function AIGeneratingState({
  steps = DEFAULT_STEPS,
  currentStepIndex,
  progress = 0,
}: AIGeneratingStateProps) {
  // 更新步骤状态
  const updatedSteps: GenerationStep[] = steps.map((step, index) => ({
    ...step,
    status:
      index < currentStepIndex
        ? "completed"
        : index === currentStepIndex
        ? "loading"
        : "pending",
  }));

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* 主加载动画 */}
          <div className="relative">
            <div className="absolute inset-0 animate-pulse">
              <div className="h-20 w-20 rounded-full bg-primary/10 blur-xl" />
            </div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                AI
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">AI 正在生成计划</h3>
            <p className="text-sm text-muted-foreground">
              请稍候，这可能需要几秒钟时间...
            </p>
          </div>

          {/* 进度条 */}
          <div className="w-full max-w-xs space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>

          {/* 步骤列表 */}
          <div className="w-full max-w-xs">
            {updatedSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col">
                <div
                  className={cn(
                    "flex items-center gap-3 py-2 transition-colors",
                    step.status === "loading" && "text-primary",
                    step.status === "completed" && "text-green-600"
                  )}
                >
                  <StepIcon status={step.status} icon={step.icon} />
                  <span
                    className={cn(
                      "text-sm",
                      step.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.status === "loading" && (
                    <RefreshCw className="ml-auto h-3 w-3 animate-spin" />
                  )}
                  {step.status === "completed" && (
                    <Check className="ml-auto h-3.5 w-3.5" />
                  )}
                </div>
                {index < updatedSteps.length - 1 && (
                  <StepConnector status={step.status} />
                )}
              </div>
            ))}
          </div>

          {/* 提示 */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground max-w-xs">
            <p>💡 提示：AI 会根据你的目标复杂度自动调整任务数量和粒度</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 简化的内联加载状态
export function InlineGeneratingState({ message = "生成中..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}
