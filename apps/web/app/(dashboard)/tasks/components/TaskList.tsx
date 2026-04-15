"use client";

import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";
import type { Task } from "../types";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDefer: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onCreateTask?: () => void;
  emptyState?: "all" | "filter" | "search";
  searchQuery?: string;
  onClearSearch?: () => void;
  className?: string;
}

// 列表项高度（用于虚拟列表估算）
const ITEM_HEIGHT = 120;
const OVERSCAN = 5;

export function TaskList({
  tasks,
  isLoading,
  hasMore,
  onLoadMore,
  onToggleComplete,
  onEdit,
  onDelete,
  onDefer,
  onTaskClick,
  onCreateTask,
  emptyState = "all",
  searchQuery,
  onClearSearch,
  className,
}: TaskListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 空状态渲染
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">加载任务中...</p>
        </div>
      );
    }

    if (tasks.length === 0) {
      if (emptyState === "search" && searchQuery) {
        return (
          <EmptyState
            icon="search"
            title="未找到匹配的任务"
            description={`没有找到包含 "${searchQuery}" 的任务`}
            action={
              onClearSearch
                ? {
                    label: "清除搜索",
                    onClick: onClearSearch,
                  }
                : undefined
            }
          />
        );
      }

      if (emptyState === "filter") {
        return (
          <EmptyState
            icon="tasks"
            title="没有符合条件的任务"
            description="尝试切换其他筛选条件查看任务"
            action={
              onCreateTask
                ? {
                    label: "创建任务",
                    onClick: onCreateTask,
                  }
                : undefined
            }
          />
        );
      }

      return (
        <EmptyState
          icon="tasks"
          title="还没有任务"
          description="开始创建你的第一个任务，追踪你的工作进度"
          action={
            onCreateTask
              ? {
                  label: "创建任务",
                  onClick: onCreateTask,
                }
              : undefined
          }
        />
      );
    }

    return null;
  };

  // 如果列表为空，显示空状态
  const emptyContent = renderEmptyState();
  if (emptyContent) {
    return <div className={className}>{emptyContent}</div>;
  }

  return (
    <div ref={containerRef} className={className}>
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.03, 0.3),
                layout: { duration: 0.2 },
              }}
            >
              <TaskCard
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onDefer={onDefer}
                onClick={onTaskClick}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* 加载更多 */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                加载中...
              </>
            ) : (
              "加载更多"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// 虚拟列表版本（用于大量任务）
interface VirtualTaskListProps extends Omit<TaskListProps, "className"> {
  itemHeight?: number;
  overscan?: number;
}

export function VirtualTaskList({
  tasks,
  itemHeight = ITEM_HEIGHT,
  overscan = OVERSCAN,
  ...props
}: VirtualTaskListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => setScrollTop(container.scrollTop);
    const resizeObserver = new ResizeObserver((entries) => {
      setContainerHeight(entries[0].contentRect.height);
    });

    container.addEventListener("scroll", handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  // 计算可见范围
  const { virtualItems, totalHeight, startIndex } = useMemo(() => {
    const totalHeight = tasks.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(tasks.length, startIndex + visibleCount);

    const virtualItems = tasks.slice(startIndex, endIndex).map((task, index) => ({
      task,
      index: startIndex + index,
      style: {
        position: "absolute" as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));

    return { virtualItems, totalHeight, startIndex };
  }, [tasks, scrollTop, containerHeight, itemHeight, overscan]);

  if (tasks.length === 0) {
    return (
      <div className="h-full overflow-auto">
        <TaskList {...props} tasks={tasks} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto relative"
      style={{ contain: "strict" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <AnimatePresence mode="popLayout">
          {virtualItems.map(({ task, index, style }) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={style}
            >
              <TaskCard
                task={task}
                onToggleComplete={props.onToggleComplete}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                onDefer={props.onDefer}
                onClick={props.onTaskClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
