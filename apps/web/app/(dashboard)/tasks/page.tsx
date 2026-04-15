"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  ListTodo,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "./components/TaskList";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { JustStartMode } from "./components/JustStartMode";
import { ProgressBar, TaskStatsProgress } from "./components/ProgressBar";
import {
  getTasksAction,
  getTaskStatsAction,
  toggleTaskCompleteAction,
  deleteTaskAction,
  deferTaskAction,
  addSubTaskAction,
  toggleSubTaskAction,
  addNoteAction,
  startTimeEntryAction,
  stopTimeEntryAction,
  getTinyTaskForJustStartAction,
} from "./actions/task-actions";
import type {
  Task,
  FilterOption,
  SortOption,
  TaskStats,
  TaskQueryParams,
} from "./types";

// 筛选标签配置
const filterTabs: { value: FilterOption; label: string; icon: typeof ListTodo }[] = [
  { value: "all", label: "全部", icon: ListTodo },
  { value: "in_progress", label: "进行中", icon: Zap },
  { value: "completed", label: "已完成", icon: CheckSquare },
  { value: "deferred", label: "已推迟", icon: Sparkles },
];

// 排序选项
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "priority", label: "按优先级" },
  { value: "dueDate", label: "按截止日期" },
  { value: "createdAt", label: "按创建时间" },
  { value: "estimatedTime", label: "按预计时间" },
];

export default function TasksPage() {
  const queryClient = useQueryClient();
  
  // 状态
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isJustStartOpen, setIsJustStartOpen] = useState(false);
  const [justStartTask, setJustStartTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 查询参数
  const queryParams: TaskQueryParams = useMemo(
    () => ({
      filter,
      search: debouncedSearch,
      sortBy,
      sortOrder,
    }),
    [filter, debouncedSearch, sortBy, sortOrder]
  );

  // 数据查询
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", queryParams],
    queryFn: () => getTasksAction(queryParams),
  });

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["taskStats"],
    queryFn: getTaskStatsAction,
    refetchInterval: 30000,
  });

  const tasks = tasksData?.tasks || [];
  const stats: TaskStats = statsData?.stats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    deferred: 0,
    overdue: 0,
    completionRate: 0,
  };

  // Mutations
  const toggleCompleteMutation = useMutation({
    mutationFn: toggleTaskCompleteAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      setIsDetailOpen(false);
    },
  });

  const deferTaskMutation = useMutation({
    mutationFn: deferTaskAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
    },
  });

  const addSubTaskMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      addSubTaskAction(taskId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleSubTaskMutation = useMutation({
    mutationFn: ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) =>
      toggleSubTaskAction(taskId, subTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      addNoteAction(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: startTimeEntryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: ({ taskId, timeEntryId }: { taskId: string; timeEntryId: string }) =>
      stopTimeEntryAction(taskId, timeEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // 事件处理
  const handleToggleComplete = useCallback(
    (id: string) => {
      toggleCompleteMutation.mutate(id);
    },
    [toggleCompleteMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTaskMutation.mutate(id);
    },
    [deleteTaskMutation]
  );

  const handleDefer = useCallback(
    (id: string) => {
      deferTaskMutation.mutate({ id });
    },
    [deferTaskMutation]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  }, []);

  const handleUpdateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      // 更新任务逻辑
      console.log("Update task:", id, updates);
    },
    []
  );

  const handleAddSubTask = useCallback(
    (taskId: string, title: string) => {
      addSubTaskMutation.mutate({ taskId, title });
    },
    [addSubTaskMutation]
  );

  const handleToggleSubTask = useCallback(
    (taskId: string, subTaskId: string) => {
      toggleSubTaskMutation.mutate({ taskId, subTaskId });
    },
    [toggleSubTaskMutation]
  );

  const handleAddNote = useCallback(
    (taskId: string, content: string) => {
      addNoteMutation.mutate({ taskId, content });
    },
    [addNoteMutation]
  );

  const handleStartTimer = useCallback(
    (taskId: string) => {
      startTimerMutation.mutate(taskId);
    },
    [startTimerMutation]
  );

  const handleStopTimer = useCallback(
    (taskId: string, timeEntryId: string) => {
      stopTimerMutation.mutate({ taskId, timeEntryId });
    },
    [stopTimerMutation]
  );

  // Just Start 模式
  const handleOpenJustStart = useCallback(async () => {
    const result = await getTinyTaskForJustStartAction();
    if (result.success && result.task) {
      setJustStartTask(result.task);
      setIsJustStartOpen(true);
    }
  }, []);

  const handleJustStartComplete = useCallback(
    (taskId: string) => {
      setTimeout(() => {
        toggleCompleteMutation.mutate(taskId);
        setIsJustStartOpen(false);
        setJustStartTask(null);
      }, 1500);
    },
    [toggleCompleteMutation]
  );

  const handleJustStartSkip = useCallback(async () => {
    const result = await getTinyTaskForJustStartAction();
    if (result.success && result.task) {
      setJustStartTask(result.task);
    }
  }, []);

  // 当前选中的任务数据
  const currentTask = useMemo(() => {
    if (!selectedTask) return null;
    return tasks.find((t) => t.id === selectedTask.id) || selectedTask;
  }, [selectedTask, tasks]);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* 左侧标题 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">任务管理</h1>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(), "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                </p>
              </div>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-2">
              {/* Just Start 按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex gap-1.5"
                onClick={handleOpenJustStart}
              >
                <Zap className="w-4 h-4" />
                Just Start
              </Button>

              {/* 新建任务按钮 */}
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">新建任务</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="总任务"
            value={stats.total}
            color="bg-blue-500"
          />
          <StatsCard
            title="进行中"
            value={stats.inProgress}
            color="bg-amber-500"
          />
          <StatsCard
            title="已完成"
            value={stats.completed}
            color="bg-emerald-500"
          />
          <StatsCard
            title="完成率"
            value={`${stats.completionRate}%`}
            color="bg-violet-500"
            isPercentage
          />
        </div>

        {/* 进度条 */}
        <div className="mb-8 p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">总体进度</h3>
            <TaskStatsProgress
              completed={stats.completed}
              total={stats.total}
            />
          </div>
          <ProgressBar progress={stats.completionRate} size="md" />
        </div>

        {/* 工具栏 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* 筛选标签 */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
            <TabsList className="h-10">
              {filterTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 px-3"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* 搜索和排序 */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <motion.span
                  animate={{ rotate: sortOrder === "asc" ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  ↓
                </motion.span>
              </Button>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        <TaskList
          tasks={tasks}
          isLoading={isTasksLoading}
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => {
            setSelectedTask(task);
            setIsDetailOpen(true);
          }}
          onDelete={handleDelete}
          onDefer={handleDefer}
          onTaskClick={handleTaskClick}
          onCreateTask={() => console.log("Create task")}
          emptyState={searchQuery ? "search" : filter !== "all" ? "filter" : "all"}
          searchQuery={debouncedSearch}
          onClearSearch={() => setSearchQuery("")}
        />
      </main>

      {/* 任务详情抽屉 */}
      <TaskDetailSheet
        task={currentTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={handleUpdateTask}
        onToggleComplete={handleToggleComplete}
        onAddSubTask={handleAddSubTask}
        onToggleSubTask={handleToggleSubTask}
        onAddNote={handleAddNote}
        onStartTimer={handleStartTimer}
        onStopTimer={handleStopTimer}
      />

      {/* Just Start 模式 */}
      <JustStartMode
        isOpen={isJustStartOpen}
        task={justStartTask}
        onClose={() => {
          setIsJustStartOpen(false);
          setJustStartTask(null);
        }}
        onComplete={handleJustStartComplete}
        onSkip={handleJustStartSkip}
      />
    </div>
  );
}

// 统计卡片组件
function StatsCard({
  title,
  value,
  color,
  isPercentage = false,
}: {
  title: string;
  value: number | string;
  color: string;
  isPercentage?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card border"
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <span className="text-white font-semibold text-lg">
            {typeof value === "number" ? Math.min(value, 99) : value}
          </span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {typeof value === "number" && !isPercentage ? value : value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
