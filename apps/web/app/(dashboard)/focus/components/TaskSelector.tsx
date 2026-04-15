'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Flag, Search, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Task } from '../types';

// 模拟今日任务
const MOCK_TODAY_TASKS: Task[] = [
  {
    id: '1',
    title: '完成项目需求文档',
    description: '整理用户需求，编写PRD文档',
    priority: 'high',
    estimatedMinutes: 60,
    completed: false,
    category: '工作',
  },
  {
    id: '2',
    title: '代码审查',
    description: '审查团队成员提交的代码',
    priority: 'medium',
    estimatedMinutes: 30,
    completed: false,
    category: '工作',
  },
  {
    id: '3',
    title: '学习新技术',
    description: '阅读React文档，了解新特性',
    priority: 'low',
    estimatedMinutes: 45,
    completed: false,
    category: '学习',
  },
  {
    id: '4',
    title: '回复邮件',
    description: '处理积压的邮件',
    priority: 'medium',
    estimatedMinutes: 20,
    completed: false,
    category: '工作',
  },
  {
    id: '5',
    title: '编写测试用例',
    description: '为新功能编写单元测试',
    priority: 'high',
    estimatedMinutes: 40,
    completed: false,
    category: '工作',
  },
];

interface TaskSelectorProps {
  selectedTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  isCompact?: boolean;
}

export function TaskSelector({ selectedTask, onSelectTask, isCompact = false }: TaskSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤任务
  const filteredTasks = MOCK_TODAY_TASKS.filter(
    (task) =>
      !task.completed &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50 dark:bg-red-950';
      case 'medium':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950';
      case 'low':
        return 'text-green-500 bg-green-50 dark:bg-green-950';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  // 获取优先级标签
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高优先级';
      case 'medium':
        return '中优先级';
      case 'low':
        return '低优先级';
      default:
        return priority;
    }
  };

  // 紧凑模式
  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        {selectedTask ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{selectedTask.title}</span>
            <button
              onClick={() => onSelectTask(null)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            选择任务
          </Button>
        )}

        {/* 选择弹窗 */}
        <TaskSelectDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          tasks={filteredTasks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTask={(task) => {
            onSelectTask(task);
            setIsOpen(false);
          }}
          getPriorityColor={getPriorityColor}
          getPriorityLabel={getPriorityLabel}
        />
      </div>
    );
  }

  // 完整模式
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            选择专注任务
          </h3>
          <span className="text-xs text-muted-foreground">
            {filteredTasks.length} 个待办
          </span>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 任务列表 */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectTask(task)}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-all',
                    selectedTask?.id === task.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 选择指示器 */}
                    <div className="mt-0.5">
                      {selectedTask?.id === task.id ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* 任务信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* 标签 */}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs',
                            getPriorityColor(task.priority)
                          )}
                        >
                          <Flag className="h-3 w-3" />
                          {getPriorityLabel(task.priority)}
                        </span>

                        {task.estimatedMinutes && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.estimatedMinutes}分钟
                          </span>
                        )}

                        {task.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>没有找到匹配的任务</p>
                <p className="text-sm mt-1">今天还没有待办任务</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 快速开始按钮 */}
        {!selectedTask && filteredTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSelectTask(filteredTasks[0])}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              快速开始第一个任务
            </Button>
          </div>
        )}

        {/* 已选任务显示 */}
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t"
          >
            <p className="text-sm text-muted-foreground mb-2">当前选择:</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedTask.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectTask(null)}
              >
                更换
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// 任务选择对话框组件
interface TaskSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTask: (task: Task) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
}

function TaskSelectDialog({
  isOpen,
  onClose,
  tasks,
  searchQuery,
  onSearchChange,
  onSelectTask,
  getPriorityColor,
  getPriorityLabel,
}: TaskSelectDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-card border rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">选择专注任务</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 搜索 */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          {/* 任务列表 */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="w-full p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <p className="font-medium">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs',
                        getPriorityColor(task.priority)
                      )}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>
                    {task.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground">
                        {task.estimatedMinutes}分钟
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>没有找到匹配的任务</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
