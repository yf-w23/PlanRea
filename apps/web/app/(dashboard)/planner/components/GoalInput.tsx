"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Sparkles } from "lucide-react";

interface GoalInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

const EXAMPLE_GOALS = [
  "在3个月内学会Python编程，能够独立完成数据分析项目，包括数据清洗、可视化和简单的机器学习模型应用",
  "准备PMP项目管理认证考试，通过系统学习项目管理知识体系，在2个月内完成备考并通过考试",
  "开发一个个人博客网站，使用Next.js和Tailwind CSS，包含文章发布、评论功能和响应式设计",
  "完成硕士论文初稿，研究方向是人工智能在教育领域的应用，需要完成文献综述、实验设计和数据分析",
];

export function GoalInput({
  value,
  onChange,
  maxLength = 1000,
  placeholder = "描述你的目标...",
}: GoalInputProps) {
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  const insertExample = () => {
    const randomExample = EXAMPLE_GOALS[Math.floor(Math.random() * EXAMPLE_GOALS.length)];
    onChange(randomExample);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>目标输入</CardTitle>
        </div>
        <CardDescription>
          清晰描述你的目标，AI将帮你分解为可执行的任务
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="min-h-[160px] resize-none"
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            <span className={isOverLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : ""}>
              {charCount}
            </span>
            <span>/{maxLength}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={insertExample}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          使用示例
        </button>

        {value.length === 0 && (
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
            <p className="font-medium">建议包含的内容：</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>具体要达成什么目标</li>
              <li>期望的时间范围</li>
              <li>需要交付的成果</li>
              <li>任何特殊要求或约束</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
