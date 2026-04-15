'use client';

/**
 * 专注模式主页面
 * 
 * 功能：
 * 1. 全屏沉浸式专注界面
 * 2. 倒计时计时器（支持番茄钟/深度专注/自定义）
 * 3. 任务选择器
 * 4. 干扰拦截（离开页面检测）
 * 5. 完成庆祝动画
 * 6. 白噪音背景音效
 * 7. 专注数据统计
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  BarChart3,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFocus } from './hooks/useFocus';
import {
  FocusTimer,
  DistractionBlocker,
  SessionComplete,
  TaskSelector,
  AmbientSound,
} from './components';
import { logFocusSessionAction, getFocusStatsAction } from './actions/focus-actions';
import type { Task, FocusSession, FocusStats } from './types';

// 模拟的待办任务
const MOCK_UPCOMING_TASKS: Task[] = [
  {
    id: '1',
    title: '完成项目需求文档',
    priority: 'high',
    estimatedMinutes: 60,
    completed: false,
  },
  {
    id: '2',
    title: '代码审查',
    priority: 'medium',
    estimatedMinutes: 30,
    completed: false,
  },
  {
    id: '3',
    title: '学习新技术',
    priority: 'low',
    estimatedMinutes: 45,
    completed: false,
  },
];

export default function FocusPage() {
  // ============ 状态管理 ============
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  // ============ 专注Hook ============
  const handleSessionComplete = useCallback(async (session: FocusSession) => {
    // 记录专注会话
    const result = await logFocusSessionAction({
      taskId: session.taskId,
      taskTitle: session.taskTitle,
      plannedDuration: Math.floor(session.duration / 60),
      actualDuration: Math.floor((session.duration - session.remainingTime) / 60),
      completed: true,
      interruptions: session.interruptions,
      ambientSound: session.ambientSound,
    });

    if (result.success) {
      // 刷新统计数据
      const statsResult = await getFocusStatsAction();
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    }
  }, []);

  const handleSessionLog = useCallback(async (input: Parameters<typeof logFocusSessionAction>[0]) => {
    await logFocusSessionAction(input);
  }, []);

  const {
    session,
    isRunning,
    isPaused,
    isCompleted,
    isIdle,
    formattedTime,
    progress,
    actions,
  } = useFocus({
    onSessionComplete: handleSessionComplete,
    onSessionLog: handleSessionLog,
  });

  // ============ 全屏控制 ============
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  }, []);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ============ 统计数据加载 ============
  useEffect(() => {
    const loadStats = async () => {
      const result = await getFocusStatsAction();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    };
    loadStats();
  }, []);

  // ============ 任务选择 ============
  const handleSelectTask = useCallback((task: Task | null) => {
    actions.selectTask(task);
  }, [actions]);

  // ============ 休息开始 ============
  const handleStartBreak = useCallback(() => {
    // 重置专注状态，可以切换到休息模式
    actions.resetFocus('pomodoro');
  }, [actions]);

  // ============ 开始下一个任务 ============
  const handleStartNextTask = useCallback((task: Task) => {
    actions.selectTask(task);
    actions.resetFocus('pomodoro');
  }, [actions]);

  // ============ 渲染 ============
  return (
    <div className="min-h-screen bg-background">
      {/* 干扰拦截器 */}
      <DistractionBlocker
        isActive={isRunning}
        onInterruption={actions.recordInterruption}
      />

      {/* 顶部导航栏 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b"
      >
        {/* 左侧：返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">退出</span>
        </Button>

        {/* 中间：当前任务 */}
        <div className="flex-1 flex justify-center">
          <TaskSelector
            selectedTask={session.taskId ? { id: session.taskId, title: session.taskTitle, priority: 'medium', completed: false } : null}
            onSelectTask={handleSelectTask}
            isCompact={true}
          />
        </div>

        {/* 右侧：控制按钮 */}
        <div className="flex items-center gap-1">
          {/* 白噪音控制 */}
          <AmbientSound
            currentSound={session.ambientSound}
            volume={session.volume}
            isPlaying={isRunning && session.ambientSound !== 'none'}
            onSoundChange={actions.setAmbientSound}
            onVolumeChange={actions.setVolume}
            onTogglePlay={() => {}}
          />

          {/* 统计按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowStats(!showStats)}
            className={showStats ? 'text-primary' : ''}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>

          {/* 全屏按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.header>

      {/* 主内容区 */}
      <main className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4">
        <AnimatePresence mode="wait">
          {isCompleted ? (
            // 完成状态
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <SessionComplete
                session={session}
                onStartBreak={handleStartBreak}
                onStartNextTask={handleStartNextTask}
                onRestart={() => actions.resetFocus('pomodoro')}
                upcomingTasks={MOCK_UPCOMING_TASKS}
              />
            </motion.div>
          ) : (
            // 专注计时器
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              {/* 统计面板（可展开） */}
              <AnimatePresence>
                {showStats && stats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-8"
                  >
                    <div className="bg-card border rounded-xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        专注统计
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{stats.totalSessions}</p>
                          <p className="text-xs text-muted-foreground">总次数</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{stats.totalFocusTime}</p>
                          <p className="text-xs text-muted-foreground">总分钟</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{stats.completedSessions}</p>
                          <p className="text-xs text-muted-foreground">完成</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{stats.dailyStreak}</p>
                          <p className="text-xs text-muted-foreground">连续天数</p>
                        </div>
                      </div>

                      {/* 周统计图表 */}
                      <div className="mt-6">
                        <p className="text-sm text-muted-foreground mb-3">近7天专注时长</p>
                        <div className="flex items-end gap-2 h-24">
                          {stats.weeklyStats.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.min((day.minutes / 120) * 100, 100)}%` }}
                                className="w-full bg-primary/20 rounded-t-md relative group"
                              >
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all"
                                  style={{ height: '100%' }}
                                />
                                {/* 提示 */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {day.minutes}分钟
                                </div>
                              </motion.div>
                              <span className="text-xs text-muted-foreground">{day.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 计时器 */}
              <div className="bg-card border rounded-2xl p-8 shadow-sm">
                <FocusTimer
                  session={session}
                  formattedTime={formattedTime}
                  progress={progress}
                  isRunning={isRunning}
                  isPaused={isPaused}
                  isIdle={isIdle}
                  isCompleted={isCompleted}
                  onStart={actions.startFocus}
                  onPause={actions.pauseFocus}
                  onResume={actions.resumeFocus}
                  onSkip={actions.skipFocus}
                  onComplete={actions.completeFocus}
                  onDurationChange={actions.setDuration}
                  onReset={() => actions.resetFocus('pomodoro')}
                />
              </div>

              {/* 当前专注信息 */}
              {(isRunning || isPaused) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    本次专注已记录 {session.interruptions} 次分心
                  </p>
                  {session.interruptions > 0 && (
                    <p className="text-xs text-amber-500 mt-1">
                      尽量不要切换窗口，保持专注
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部提示 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 left-0 right-0 text-center pointer-events-none"
      >
        <p className="text-xs text-muted-foreground">
          {isRunning
            ? '专注中... 切换窗口会记录分心'
            : isCompleted
            ? '恭喜完成一次专注训练！'
            : '选择任务，开始你的专注时光'}
        </p>
      </motion.footer>
    </div>
  );
}
