"use client";

/**
 * AI Planner 规划器主页面
 * 
 * 功能：
 * 1. 目标输入表单
 * 2. 文档上传区域
 * 3. 截止日期选择器
 * 4. 每周可用时间滑块
 * 5. AI生成计划按钮
 * 6. 任务分解展示
 * 7. 时间线预览
 */

import * as React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  ListTodo,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";

// 导入组件
import { GoalInput } from "./components/GoalInput";
import { DocumentUploader } from "./components/DocumentUploader";
import { PlanConfigForm } from "./components/PlanConfigForm";
import { AIGeneratingState, type GenerationStep } from "./components/AIGeneratingState";
import { TaskBreakdown } from "./components/TaskBreakdown";
import { TimelinePreview } from "./components/TimelinePreview";

// 导入类型
import type { Task, UploadedFile, Plan, PlanMetadata } from "./types";

// 导入 Server Actions
import {
  generatePlanAction,
  savePlanAction,
  type GeneratePlanInput,
  type SavePlanInput,
} from "./actions/plan-actions";

// 生成步骤配置
const GENERATION_STEPS: GenerationStep[] = [
  { id: "analyzing", label: "分析目标...", status: "pending", icon: undefined },
  { id: "identifying", label: "识别主要任务", status: "pending", icon: undefined },
  { id: "estimating", label: "估算时间需求", status: "pending", icon: undefined },
  { id: "optimizing", label: "优化任务顺序...", status: "pending", icon: undefined },
];

// 默认计划元数据
const createDefaultMetadata = (deadline: Date): PlanMetadata => ({
  createdAt: new Date().toISOString(),
  deadline: deadline.toISOString(),
  totalEstimatedHours: 0,
  workingDays: 0,
  dailyAverageHours: 0,
});

export default function AIPlannerPage() {
  // ============ 表单状态 ============
  const [goal, setGoal] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [deadline, setDeadline] = useState<Date>(addDays(new Date(), 14));
  const [weeklyAvailableHours, setWeeklyAvailableHours] = useState(20);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // 周一到周五

  // ============ 生成状态 ============
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // ============ 结果状态 ============
  const [generatedPlan, setGeneratedPlan] = useState<{
    tasks: Task[];
    metadata: PlanMetadata;
    summary: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  // ============ 保存状态 ============
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ============ 表单验证 ============
  const validateForm = useCallback((): { valid: boolean; error?: string } => {
    if (!goal.trim()) {
      return { valid: false, error: "请输入目标描述" };
    }
    if (goal.trim().length < 10) {
      return { valid: false, error: "目标描述至少需要10个字符" };
    }
    if (!deadline) {
      return { valid: false, error: "请选择截止日期" };
    }
    if (deadline < new Date()) {
      return { valid: false, error: "截止日期必须是未来日期" };
    }
    if (workingDays.length === 0) {
      return { valid: false, error: "请至少选择一个工作日" };
    }
    if (weeklyAvailableHours <= 0) {
      return { valid: false, error: "每周可用时间必须大于0" };
    }
    return { valid: true };
  }, [goal, deadline, workingDays, weeklyAvailableHours]);

  // ============ AI生成计划 ============
  const handleGeneratePlan = async () => {
    // 验证表单
    const validation = validateForm();
    if (!validation.valid) {
      setGenerationError(validation.error || "表单验证失败");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);
    setCurrentStepIndex(0);
    setGeneratedPlan(null);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
        setCurrentStepIndex((prev) => {
          if (prev >= GENERATION_STEPS.length - 1) return prev;
          return prev + 0.3;
        });
      }, 500);

      // 准备输入
      const input: GeneratePlanInput = {
        title: goal.slice(0, 100),
        description: goal,
        deadline: deadline.toISOString(),
        availableHoursPerDay: Math.round((weeklyAvailableHours / workingDays.length) * 10) / 10,
        workingDaysPerWeek: workingDays.length,
        workingDays,
        uploadedFiles: uploadedFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          content: f.content,
        })),
      };

      // 调用 Server Action
      const result = await generatePlanAction(input);

      clearInterval(progressInterval);

      if (!result.success || !result.plan) {
        setGenerationError(result.error || "生成计划失败");
        setGenerationProgress(0);
        setCurrentStepIndex(0);
        return;
      }

      // 设置生成的计划
      setGenerationProgress(100);
      setCurrentStepIndex(GENERATION_STEPS.length - 1);
      
      // 转换 AI 返回的计划格式
      const plan = result.plan;
      setGeneratedPlan({
        tasks: plan.tasks.map((t, i) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          estimatedHours: t.estimatedHours,
          priority: t.priority,
          dependencies: t.dependencies || [],
          category: t.category,
          order: t.order || i + 1,
        })),
        metadata: plan.metadata,
        summary: plan.summary,
      });

      // 切换到结果标签
      setTimeout(() => {
        setActiveTab("tasks");
      }, 500);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "生成计划时发生错误");
      setGenerationProgress(0);
      setCurrentStepIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // ============ 保存计划 ============
  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const input: SavePlanInput = {
        title: goal.slice(0, 100),
        description: goal,
        tasks: generatedPlan.tasks,
        metadata: generatedPlan.metadata,
        summary: generatedPlan.summary,
      };

      const result = await savePlanAction(input);

      if (!result.success) {
        setSaveError(result.error || "保存失败");
        return;
      }

      setShowSaveSuccess(true);
      setShowSaveDialog(false);
      
      // 3秒后隐藏成功提示
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存时发生错误");
    } finally {
      setIsSaving(false);
    }
  };

  // ============ 重置表单 ============
  const handleReset = () => {
    setGoal("");
    setUploadedFiles([]);
    setDeadline(addDays(new Date(), 14));
    setWeeklyAvailableHours(20);
    setWorkingDays([1, 2, 3, 4, 5]);
    setGeneratedPlan(null);
    setGenerationError(null);
    setActiveTab("input");
  };

  // ============ 更新任务 ============
  const handleTasksChange = (newTasks: Task[]) => {
    if (!generatedPlan) return;

    // 重新计算元数据
    const totalHours = newTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const dailyAverage = Math.round((totalHours / Math.max(generatedPlan.metadata.workingDays, 1)) * 10) / 10;

    setGeneratedPlan({
      ...generatedPlan,
      tasks: newTasks,
      metadata: {
        ...generatedPlan.metadata,
        totalEstimatedHours: Math.round(totalHours * 10) / 10,
        dailyAverageHours: dailyAverage,
      },
    });
  };

  // ============ 渲染 ============
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Planner</h1>
            <p className="text-sm text-muted-foreground">
              智能规划助手，将目标分解为可执行的任务计划
            </p>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="input" disabled={isGenerating}>
            <LayoutTemplate className="h-4 w-4 mr-2" />
            输入配置
          </TabsTrigger>
          <TabsTrigger value="tasks" disabled={!generatedPlan || isGenerating}>
            <ListTodo className="h-4 w-4 mr-2" />
            任务分解
          </TabsTrigger>
          <TabsTrigger value="timeline" disabled={!generatedPlan || isGenerating}>
            <CalendarDays className="h-4 w-4 mr-2" />
            时间线
          </TabsTrigger>
        </TabsList>

        {/* 输入配置标签 */}
        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：目标输入和文档上传 */}
            <div className="space-y-6">
              <GoalInput
                value={goal}
                onChange={setGoal}
                maxLength={1000}
              />
              <DocumentUploader
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
              />
            </div>

            {/* 右侧：计划配置 */}
            <div className="space-y-6">
              <PlanConfigForm
                deadline={deadline}
                onDeadlineChange={setDeadline}
                weeklyAvailableHours={weeklyAvailableHours}
                onWeeklyHoursChange={setWeeklyAvailableHours}
                workingDays={workingDays}
                onWorkingDaysChange={setWorkingDays}
              />

              {/* 生成按钮区域 */}
              {isGenerating ? (
                <AIGeneratingState
                  steps={GENERATION_STEPS}
                  currentStepIndex={Math.floor(currentStepIndex)}
                  progress={Math.round(generationProgress)}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    {/* 错误提示 */}
                    {generationError && (
                      <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{generationError}</span>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleGeneratePlan}
                        disabled={!goal.trim()}
                        className="flex-1"
                        size="lg"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI 生成计划
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={!goal && uploadedFiles.length === 0}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* 表单验证提示 */}
                    <div className="mt-4 text-xs text-muted-foreground space-y-1">
                      <p>生成前请确保：</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li className={goal.trim().length >= 10 ? "text-green-600" : ""}>
                          目标描述清晰（至少10个字符）
                        </li>
                        <li className={deadline > new Date() ? "text-green-600" : ""}>
                          截止日期设置合理
                        </li>
                        <li className={workingDays.length > 0 ? "text-green-600" : ""}>
                          至少选择一个工作日
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* 任务分解标签 */}
        <TabsContent value="tasks" className="space-y-6">
          {generatedPlan && (
            <>
              {/* 摘要卡片 */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">计划摘要</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {generatedPlan.summary}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("input")}
                      >
                        返回修改
                      </Button>
                      <Button onClick={() => setShowSaveDialog(true)}>
                        <Save className="h-4 w-4 mr-2" />
                        保存计划
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 任务列表 */}
              <TaskBreakdown
                tasks={generatedPlan.tasks}
                onTasksChange={handleTasksChange}
              />
            </>
          )}
        </TabsContent>

        {/* 时间线标签 */}
        <TabsContent value="timeline" className="space-y-6">
          {generatedPlan && (
            <TimelinePreview
              tasks={generatedPlan.tasks}
              metadata={generatedPlan.metadata}
              deadline={deadline}
              workingDays={workingDays}
              weeklyAvailableHours={weeklyAvailableHours}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* 保存成功提示 */}
      {showSaveSuccess && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>计划保存成功！</span>
          </div>
        </div>
      )}

      {/* 保存对话框 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存计划</DialogTitle>
            <DialogDescription>
              确认要保存这个计划吗？保存后可以在计划列表中查看和管理。
            </DialogDescription>
          </DialogHeader>
          
          {generatedPlan && (
            <div className="py-4 space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">计划标题：</span>
                <span className="font-medium">{goal.slice(0, 100)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">任务数量：</span>
                <span className="font-medium">{generatedPlan.tasks.length} 个</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">预计总工时：</span>
                <span className="font-medium">{generatedPlan.metadata.totalEstimatedHours} 小时</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">截止日期：</span>
                <span className="font-medium">
                  {format(new Date(generatedPlan.metadata.deadline), "yyyy年MM月dd日", { locale: zhCN })}
                </span>
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {saveError}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSavePlan} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  确认保存
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
