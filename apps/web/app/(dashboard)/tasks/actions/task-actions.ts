"use server";

/**
 * 任务管理 Server Actions
 * 处理任务的 CRUD 操作
 */

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams,
  TaskStats,
  SubTask,
  Note,
  TimeEntry,
  TaskStatus,
} from "../types";

// 模拟任务数据存储（实际项目中应使用数据库）
let mockTasks: Task[] = [
  {
    id: "task-1",
    title: "完成产品需求文档",
    description: "撰写本周产品迭代的需求文档，包括用户故事和验收标准",
    priority: "high",
    status: "in_progress",
    estimatedMinutes: 120,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    plan: { id: "plan-1", title: "Q1 产品迭代" },
    subTasks: [
      { id: "sub-1", title: "收集用户反馈", completed: true, order: 1 },
      { id: "sub-2", title: "整理功能列表", completed: false, order: 2 },
      { id: "sub-3", title: "编写用户故事", completed: false, order: 3 },
    ],
    notes: [],
    timeEntries: [],
    tags: ["文档", "高优先级"],
    order: 1,
  },
  {
    id: "task-2",
    title: "团队周会",
    description: "同步本周工作进展和下周计划",
    priority: "medium",
    status: "pending",
    estimatedMinutes: 60,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    plan: undefined,
    subTasks: [],
    notes: [],
    timeEntries: [],
    tags: ["会议"],
    order: 2,
  },
  {
    id: "task-3",
    title: "代码审查",
    description: "审查前端团队的 PR，重点关注性能优化部分",
    priority: "high",
    status: "completed",
    estimatedMinutes: 90,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    plan: { id: "plan-1", title: "Q1 产品迭代" },
    subTasks: [
      { id: "sub-4", title: "Review PR #123", completed: true, order: 1 },
      { id: "sub-5", title: "Review PR #124", completed: true, order: 2 },
    ],
    notes: [
      { id: "note-1", content: "PR #123 有一些性能问题需要优化", createdAt: new Date().toISOString() },
    ],
    timeEntries: [
      { id: "time-1", startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), duration: 45, note: "Review PR #123" },
    ],
    tags: ["开发", "审查"],
    order: 3,
  },
  {
    id: "task-4",
    title: "学习 React 19 新特性",
    description: "阅读 React 19 文档，了解新特性和最佳实践",
    priority: "low",
    status: "deferred",
    estimatedMinutes: 180,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deferredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    plan: undefined,
    subTasks: [],
    notes: [],
    timeEntries: [],
    tags: ["学习", "React"],
    order: 4,
  },
  {
    id: "task-5",
    title: "修复登录页面 Bug",
    description: "用户反馈无法正常登录，需要紧急修复",
    priority: "high",
    status: "pending",
    estimatedMinutes: 45,
    dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    plan: { id: "plan-2", title: "Bug 修复 sprint" },
    subTasks: [
      { id: "sub-6", title: "复现问题", completed: false, order: 1 },
      { id: "sub-7", title: "定位原因", completed: false, order: 2 },
      { id: "sub-8", title: "修复并测试", completed: false, order: 3 },
    ],
    notes: [],
    timeEntries: [],
    tags: ["Bug", "紧急"],
    order: 5,
  },
  {
    id: "task-6",
    title: "更新文档网站",
    description: "更新 API 文档和示例代码",
    priority: "medium",
    status: "pending",
    estimatedMinutes: 240,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    plan: { id: "plan-1", title: "Q1 产品迭代" },
    subTasks: [],
    notes: [],
    timeEntries: [],
    tags: ["文档"],
    order: 6,
  },
  {
    id: "task-7",
    title: "设计评审会议",
    description: "新产品界面设计评审",
    priority: "medium",
    status: "completed",
    estimatedMinutes: 90,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    plan: undefined,
    subTasks: [],
    notes: [
      { id: "note-2", content: "设计方案已通过，可以进入开发阶段", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    timeEntries: [],
    tags: ["会议", "设计"],
    order: 7,
  },
  {
    id: "task-8",
    title: "优化数据库查询",
    description: "用户列表加载太慢，需要优化查询性能",
    priority: "low",
    status: "pending",
    estimatedMinutes: 120,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    plan: { id: "plan-2", title: "Bug 修复 sprint" },
    subTasks: [],
    notes: [],
    timeEntries: [],
    tags: ["性能", "后端"],
    order: 8,
  },
];

// 优先级权重（用于排序）
const priorityWeight: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * 获取任务列表
 */
export async function getTasksAction(params?: TaskQueryParams): Promise<{
  success: boolean;
  tasks?: Task[];
  error?: string;
}> {
  try {
    let filteredTasks = [...mockTasks];

    // 应用筛选
    if (params?.filter && params.filter !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.status === params.filter);
    }

    // 应用搜索
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // 应用计划筛选
    if (params?.planId) {
      filteredTasks = filteredTasks.filter((task) => task.plan?.id === params.planId);
    }

    // 应用排序
    const sortBy = params?.sortBy || "createdAt";
    const sortOrder = params?.sortOrder || "desc";

    filteredTasks.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "priority":
          comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "estimatedTime":
          comparison = b.estimatedMinutes - a.estimatedMinutes;
          break;
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return {
      success: true,
      tasks: filteredTasks,
    };
  } catch (error) {
    console.error("Get tasks error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取任务列表失败",
    };
  }
}

/**
 * 获取单个任务
 */
export async function getTaskAction(id: string): Promise<{
  success: boolean;
  task?: Task;
  error?: string;
}> {
  try {
    const task = mockTasks.find((t) => t.id === id);
    if (!task) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    return {
      success: true,
      task,
    };
  } catch (error) {
    console.error("Get task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取任务失败",
    };
  }
}

/**
 * 获取任务统计
 */
export async function getTaskStatsAction(): Promise<{
  success: boolean;
  stats?: TaskStats;
  error?: string;
}> {
  try {
    const now = new Date().toISOString();
    const total = mockTasks.length;
    const completed = mockTasks.filter((t) => t.status === "completed").length;
    const inProgress = mockTasks.filter((t) => t.status === "in_progress").length;
    const deferred = mockTasks.filter((t) => t.status === "deferred").length;
    const overdue = mockTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date(now) && t.status !== "completed"
    ).length;

    return {
      success: true,
      stats: {
        total,
        completed,
        inProgress,
        deferred,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("Get task stats error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取统计失败",
    };
  }
}

/**
 * 创建任务
 */
export async function createTaskAction(input: CreateTaskInput): Promise<{
  success: boolean;
  task?: Task;
  error?: string;
}> {
  try {
    // 验证输入
    if (!input.title.trim()) {
      return {
        success: false,
        error: "任务标题不能为空",
      };
    }

    if (input.estimatedMinutes <= 0) {
      return {
        success: false,
        error: "预计时间必须大于0",
      };
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority,
      status: "pending",
      estimatedMinutes: input.estimatedMinutes,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      plan: input.planId ? { id: input.planId, title: "计划标题" } : undefined,
      subTasks: [],
      notes: [],
      timeEntries: [],
      tags: input.tags || [],
      order: mockTasks.length + 1,
    };

    mockTasks.push(newTask);

    return {
      success: true,
      task: newTask,
    };
  } catch (error) {
    console.error("Create task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建任务失败",
    };
  }
}

/**
 * 更新任务
 */
export async function updateTaskAction(
  id: string,
  input: UpdateTaskInput
): Promise<{
  success: boolean;
  task?: Task;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const updatedTask = {
      ...mockTasks[taskIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    mockTasks[taskIndex] = updatedTask;

    return {
      success: true,
      task: updatedTask,
    };
  } catch (error) {
    console.error("Update task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新任务失败",
    };
  }
}

/**
 * 删除任务
 */
export async function deleteTaskAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    mockTasks.splice(taskIndex, 1);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "删除任务失败",
    };
  }
}

/**
 * 切换任务完成状态
 */
export async function toggleTaskCompleteAction(id: string): Promise<{
  success: boolean;
  task?: Task;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const task = mockTasks[taskIndex];
    const isCompleted = task.status === "completed";

    const updatedTask: Task = {
      ...task,
      status: isCompleted ? "pending" : "completed",
      completedAt: isCompleted ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTasks[taskIndex] = updatedTask;

    return {
      success: true,
      task: updatedTask,
    };
  } catch (error) {
    console.error("Toggle task complete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "操作失败",
    };
  }
}

/**
 * 推迟任务
 */
export async function deferTaskAction(
  id: string,
  deferredUntil?: string
): Promise<{
  success: boolean;
  task?: Task;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    // 默认推迟到明天
    const defaultDeferredDate = new Date();
    defaultDeferredDate.setDate(defaultDeferredDate.getDate() + 1);
    defaultDeferredDate.setHours(9, 0, 0, 0);

    const task = mockTasks[taskIndex];
    const isDeferred = task.status === "deferred";

    const updatedTask: Task = {
      ...task,
      status: isDeferred ? "pending" : "deferred",
      deferredUntil: isDeferred ? undefined : (deferredUntil || defaultDeferredDate.toISOString()),
      updatedAt: new Date().toISOString(),
    };

    mockTasks[taskIndex] = updatedTask;

    return {
      success: true,
      task: updatedTask,
    };
  } catch (error) {
    console.error("Defer task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "推迟任务失败",
    };
  }
}

/**
 * 添加子任务
 */
export async function addSubTaskAction(
  taskId: string,
  title: string
): Promise<{
  success: boolean;
  subTask?: SubTask;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const newSubTask: SubTask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      completed: false,
      order: mockTasks[taskIndex].subTasks.length + 1,
    };

    mockTasks[taskIndex].subTasks.push(newSubTask);

    return {
      success: true,
      subTask: newSubTask,
    };
  } catch (error) {
    console.error("Add subtask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "添加子任务失败",
    };
  }
}

/**
 * 切换子任务完成状态
 */
export async function toggleSubTaskAction(
  taskId: string,
  subTaskId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const subTaskIndex = mockTasks[taskIndex].subTasks.findIndex((st) => st.id === subTaskId);
    if (subTaskIndex === -1) {
      return {
        success: false,
        error: "子任务不存在",
      };
    }

    mockTasks[taskIndex].subTasks[subTaskIndex].completed =
      !mockTasks[taskIndex].subTasks[subTaskIndex].completed;

    return {
      success: true,
    };
  } catch (error) {
    console.error("Toggle subtask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "操作失败",
    };
  }
}

/**
 * 添加备注
 */
export async function addNoteAction(
  taskId: string,
  content: string
): Promise<{
  success: boolean;
  note?: Note;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    mockTasks[taskIndex].notes.push(newNote);

    return {
      success: true,
      note: newNote,
    };
  } catch (error) {
    console.error("Add note error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "添加备注失败",
    };
  }
}

/**
 * 开始时间记录
 */
export async function startTimeEntryAction(taskId: string): Promise<{
  success: boolean;
  timeEntry?: TimeEntry;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const newTimeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      startTime: new Date().toISOString(),
      duration: 0,
    };

    mockTasks[taskIndex].timeEntries.push(newTimeEntry);
    mockTasks[taskIndex].status = "in_progress";

    return {
      success: true,
      timeEntry: newTimeEntry,
    };
  } catch (error) {
    console.error("Start time entry error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "开始计时失败",
    };
  }
}

/**
 * 停止时间记录
 */
export async function stopTimeEntryAction(
  taskId: string,
  timeEntryId: string
): Promise<{
  success: boolean;
  timeEntry?: TimeEntry;
  error?: string;
}> {
  try {
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: "任务不存在",
      };
    }

    const timeEntryIndex = mockTasks[taskIndex].timeEntries.findIndex(
      (te) => te.id === timeEntryId
    );
    if (timeEntryIndex === -1) {
      return {
        success: false,
        error: "时间记录不存在",
      };
    }

    const timeEntry = mockTasks[taskIndex].timeEntries[timeEntryIndex];
    const endTime = new Date();
    const startTime = new Date(timeEntry.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

    mockTasks[taskIndex].timeEntries[timeEntryIndex] = {
      ...timeEntry,
      endTime: endTime.toISOString(),
      duration,
    };

    return {
      success: true,
      timeEntry: mockTasks[taskIndex].timeEntries[timeEntryIndex],
    };
  } catch (error) {
    console.error("Stop time entry error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "停止计时失败",
    };
  }
}

/**
 * 获取最适合"Just Start"的任务
 * 返回预计时间最短且未完成的微小任务
 */
export async function getTinyTaskForJustStartAction(): Promise<{
  success: boolean;
  task?: Task;
  error?: string;
}> {
  try {
    // 筛选未完成的、预计时间较短（15分钟内）的任务
    const tinyTasks = mockTasks.filter(
      (t) => t.status !== "completed" && t.status !== "deferred" && t.estimatedMinutes <= 15
    );

    if (tinyTasks.length === 0) {
      // 如果没有微小任务，找最短的未完成任务
      const incompleteTasks = mockTasks.filter(
        (t) => t.status !== "completed" && t.status !== "deferred"
      );
      
      if (incompleteTasks.length === 0) {
        return {
          success: false,
          error: "没有可用的任务",
        };
      }

      // 按预计时间排序，返回最短的
      const shortestTask = incompleteTasks.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)[0];
      return {
        success: true,
        task: shortestTask,
      };
    }

    // 随机选择一个微小任务
    const randomTask = tinyTasks[Math.floor(Math.random() * tinyTasks.length)];

    return {
      success: true,
      task: randomTask,
    };
  } catch (error) {
    console.error("Get tiny task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取任务失败",
    };
  }
}
