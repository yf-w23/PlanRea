"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  ListTodo,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Priority } from "../types";

interface TaskBreakdownProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  readOnly?: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: typeof AlertCircle }> = {
  high: { label: "高", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertCircle },
  medium: { label: "中", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  low: { label: "低", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
};

function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyTask(order: number): Task {
  return {
    id: generateTaskId(),
    title: "",
    description: "",
    estimatedHours: 1,
    priority: "medium",
    dependencies: [],
    category: "一般",
    order,
  };
}

export function TaskBreakdown({ tasks, onTasksChange, readOnly = false }: TaskBreakdownProps) {
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const highPriorityCount = tasks.filter((t) => t.priority === "high").length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === "medium").length;
  const lowPriorityCount = tasks.filter((t) => t.priority === "low").length;

  const handleAddTask = () => {
    const newTask = createEmptyTask(tasks.length + 1);
    setEditingTask(newTask);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask({ ...task });
    setIsDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!editingTask) return;

    // 验证
    if (!editingTask.title.trim()) {
      alert("请输入任务标题");
      return;
    }

    const existingIndex = tasks.findIndex((t) => t.id === editingTask.id);
    let newTasks: Task[];

    if (existingIndex >= 0) {
      // 编辑现有任务
      newTasks = tasks.map((t) => (t.id === editingTask.id ? editingTask : t));
    } else {
      // 添加新任务
      newTasks = [...tasks, editingTask];
    }

    onTasksChange(newTasks);
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("确定要删除这个任务吗？")) {
      const newTasks = tasks.filter((t) => t.id !== taskId);
      // 重新排序
      const reorderedTasks = newTasks.map((t, index) => ({ ...t, order: index + 1 }));
      onTasksChange(reorderedTasks);
    }
  };

  const handleMoveTask = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === tasks.length - 1) return;

    const newTasks = [...tasks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];

    // 更新order
    const reorderedTasks = newTasks.map((t, i) => ({ ...t, order: i + 1 }));
    onTasksChange(reorderedTasks);
  };

  // 拖拽处理
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, draggedTask);

    setDraggedIndex(index);
    onTasksChange(newTasks.map((t, i) => ({ ...t, order: i + 1 })));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <CardTitle>任务分解</CardTitle>
          </div>
          {!readOnly && (
            <Button type="button" size="sm" onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-1" />
              添加任务
            </Button>
          )}
        </div>
        <CardDescription>
          共 {tasks.length} 个任务，预计总工时 {totalHours.toFixed(1)} 小时
          <span className="ml-2 inline-flex gap-2">
            <Badge variant="outline" className="text-xs">
              高优先级 {highPriorityCount}
            </Badge>
            <Badge variant="outline" className="text-xs">
              中优先级 {mediumPriorityCount}
            </Badge>
            <Badge variant="outline" className="text-xs">
              低优先级 {lowPriorityCount}
            </Badge>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>暂无任务</p>
            {!readOnly && (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleAddTask}>
                <Plus className="h-4 w-4 mr-1" />
                添加第一个任务
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const priority = PRIORITY_CONFIG[task.priority];
              const PriorityIcon = priority.icon;

              return (
                <div
                  key={task.id}
                  draggable={!readOnly}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group flex items-start gap-2 p-3 rounded-lg border bg-card transition-colors",
                    draggedIndex === index && "opacity-50",
                    !readOnly && "hover:bg-muted/50 cursor-move"
                  )}
                >
                  {!readOnly && (
                    <div className="pt-0.5 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground mt-1">#{task.order}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{task.title}</span>
                          <Badge variant="outline" className={cn("text-xs", priority.color)}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {priority.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.estimatedHours}h
                          </Badge>
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMoveTask(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleMoveTask(index, "down")}
                        disabled={index === tasks.length - 1}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 编辑对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTask?.title ? "编辑任务" : "添加任务"}</DialogTitle>
              <DialogDescription>
                填写任务详情，AI 会根据这些信息优化计划安排
              </DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">任务标题 *</label>
                  <Input
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    placeholder="例如：完成需求分析文档"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">任务描述</label>
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, description: e.target.value })
                    }
                    placeholder="详细描述任务内容和预期产出"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">预计工时</label>
                    <Input
                      type="number"
                      min={0.5}
                      max={100}
                      step={0.5}
                      value={editingTask.estimatedHours}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          estimatedHours: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">优先级</label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          priority: e.target.value as Priority,
                        })
                      }
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">分类</label>
                    <Input
                      value={editingTask.category}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, category: e.target.value })
                      }
                      placeholder="例如：设计"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="button" onClick={handleSaveTask}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
