"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  Folder,
  Tag,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Play,
  Square,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgressBar, MiniProgress } from "./ProgressBar";
import type { Task, Priority, SubTask, Note, TimeEntry } from "../types";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onToggleComplete: (id: string) => void;
  onAddSubTask: (taskId: string, title: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onAddNote: (taskId: string, content: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string, timeEntryId: string) => void;
}

// 优先级配置
const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: "高优先级", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
  medium: { label: "中优先级", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
  low: { label: "低优先级", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
};

// 格式化时间
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}小时`;
  return `${hours}小时${remainingMinutes}分钟`;
}

// 格式化日期
function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "yyyy年MM月dd日 HH:mm", { locale: zhCN });
}

export function TaskDetailSheet({
  task,
  isOpen,
  onClose,
  onUpdate,
  onToggleComplete,
  onAddSubTask,
  onToggleSubTask,
  onAddNote,
  onStartTimer,
  onStopTimer,
}: TaskDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "time">("details");
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  if (!task) return null;

  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";
  const priority = priorityConfig[task.priority];

  // 计算子任务进度
  const subTaskProgress =
    task.subTasks.length > 0
      ? Math.round(
          (task.subTasks.filter((st) => st.completed).length / task.subTasks.length) * 100
        )
      : 0;

  // 计算总耗时
  const totalTimeSpent = task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  // 检查是否有进行中的计时
  const activeTimeEntry = task.timeEntries.find((te) => !te.endTime);

  // 处理编辑
  const handleStartEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      onAddSubTask(task.id, newSubTaskTitle);
      setNewSubTaskTitle("");
    }
  };

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(task.id, newNoteContent);
      setNewNoteContent("");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        {/* 头部 */}
        <SheetHeader className="px-6 py-4 border-b space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="font-semibold text-lg"
                    placeholder="任务标题"
                  />
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="添加描述..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className={cn(
                        "shrink-0 transition-colors",
                        isCompleted
                          ? "text-emerald-500"
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <SheetTitle
                      className={cn(
                        "text-xl leading-tight",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </SheetTitle>
                  </div>
                  {task.description && (
                    <p className="text-muted-foreground text-sm mt-2">
                      {task.description}
                    </p>
                  )}
                </>
              )}
            </div>
            {!isEditing && (
              <Button variant="ghost" size="icon-sm" onClick={handleStartEdit}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* 状态标签 */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className={cn("text-xs", priority.color)} variant="outline">
              {priority.label}
            </Badge>
            {task.plan && (
              <Badge variant="outline" className="text-xs">
                <Folder className="w-3 h-3 mr-1" />
                {task.plan.title}
              </Badge>
            )}
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* 时间信息 */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>预计 {formatDuration(task.estimatedMinutes)}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>截止 {formatDateTime(task.dueDate)}</span>
              </div>
            )}
            {totalTimeSpent > 0 && (
              <div className="flex items-center gap-1">
                <History className="w-4 h-4" />
                <span>已用 {formatDuration(totalTimeSpent)}</span>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* 标签切换 */}
        <div className="flex border-b px-6">
          {[
            { id: "details" as const, label: "详情", count: task.subTasks.length },
            { id: "notes" as const, label: "备注", count: task.notes.length },
            { id: "time" as const, label: "时间", count: task.timeEntries.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors relative",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {/* 详情标签 */}
            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 子任务 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">检查清单</h3>
                    {task.subTasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {task.subTasks.filter((st) => st.completed).length}/
                        {task.subTasks.length}
                      </span>
                    )}
                  </div>

                  {task.subTasks.length > 0 && (
                    <div className="mb-3">
                      <MiniProgress progress={subTaskProgress} />
                    </div>
                  )}

                  <div className="space-y-2">
                    {task.subTasks.map((subTask) => (
                      <SubTaskItem
                        key={subTask.id}
                        subTask={subTask}
                        onToggle={() => onToggleSubTask(task.id, subTask.id)}
                      />
                    ))}
                  </div>

                  {/* 添加子任务 */}
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      value={newSubTaskTitle}
                      onChange={(e) => setNewSubTaskTitle(e.target.value)}
                      placeholder="添加检查项..."
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubTask()}
                    />
                    <Button size="icon-xs" onClick={handleAddSubTask}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 备注标签 */}
            {activeTab === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {task.notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">暂无备注</p>
                    <p className="text-xs mt-1">添加备注来记录你的想法</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {task.notes.map((note) => (
                      <NoteItem key={note.id} note={note} />
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="添加备注..."
                    rows={2}
                  />
                  <Button
                    size="sm"
                    className="self-end"
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                  >
                    添加
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 时间标签 */}
            {activeTab === "time" && (
              <motion.div
                key="time"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* 计时器 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">
                      {activeTimeEntry ? "正在计时..." : "开始专注"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeTimeEntry
                        ? formatDistanceToNow(new Date(activeTimeEntry.startTime), {
                            addSuffix: true,
                            locale: zhCN,
                          })
                        : "记录你在这个任务上花费的时间"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={activeTimeEntry ? "destructive" : "default"}
                    onClick={() =>
                      activeTimeEntry
                        ? onStopTimer(task.id, activeTimeEntry.id)
                        : onStartTimer(task.id)
                    }
                  >
                    {activeTimeEntry ? (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        停止
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        开始
                      </>
                    )}
                  </Button>
                </div>

                {/* 时间记录列表 */}
                {task.timeEntries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">时间记录</h3>
                    <div className="space-y-2">
                      {task.timeEntries
                        .slice()
                        .reverse()
                        .map((entry) => (
                          <TimeEntryItem key={entry.id} entry={entry} />
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部信息 */}
        <SheetFooter className="px-6 py-4 border-t flex-col items-start gap-2">
          <p className="text-xs text-muted-foreground">
            创建于 {formatDateTime(task.createdAt)}
          </p>
          {task.updatedAt && (
            <p className="text-xs text-muted-foreground">
              更新于 {formatDateTime(task.updatedAt)}
            </p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// 子任务项
function SubTaskItem({
  subTask,
  onToggle,
}: {
  subTask: SubTask;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        "hover:bg-muted group"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "shrink-0 transition-colors",
          subTask.completed
            ? "text-emerald-500"
            : "text-muted-foreground hover:text-primary"
        )}
      >
        {subTask.completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          subTask.completed && "line-through text-muted-foreground"
        )}
      >
        {subTask.title}
      </span>
    </div>
  );
}

// 备注项
function NoteItem({ note }: { note: Note }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {formatDistanceToNow(new Date(note.createdAt), {
          addSuffix: true,
          locale: zhCN,
        })}
      </p>
    </div>
  );
}

// 时间记录项
function TimeEntryItem({ entry }: { entry: TimeEntry }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div>
        <p className="text-sm font-medium">
          {formatDateTime(entry.startTime)}
        </p>
        {entry.note && (
          <p className="text-xs text-muted-foreground">{entry.note}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{formatDuration(entry.duration)}</p>
        {entry.endTime && (
          <p className="text-xs text-muted-foreground">
            {format(new Date(entry.endTime), "HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}
