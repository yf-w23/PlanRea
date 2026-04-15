'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  FocusSession,
  FocusStatus,
  FocusPreset,
  AmbientSoundType,
  Task,
  LogFocusSessionInput,
} from '../types';

// 预设时长（秒）
const PRESET_DURATIONS: Record<FocusPreset, number> = {
  pomodoro: 25 * 60,
  deep: 50 * 60,
  custom: 25 * 60,
};

interface UseFocusOptions {
  onSessionComplete?: (session: FocusSession) => void;
  onSessionLog?: (input: LogFocusSessionInput) => void;
}

export function useFocus(options: UseFocusOptions = {}) {
  const { onSessionComplete, onSessionLog } = options;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 当前会话状态
  const [session, setSession] = useState<FocusSession>({
    id: `session-${Date.now()}`,
    taskId: null,
    taskTitle: '',
    duration: PRESET_DURATIONS.pomodoro,
    remainingTime: PRESET_DURATIONS.pomodoro,
    status: 'idle',
    startTime: null,
    endTime: null,
    interruptions: 0,
    ambientSound: 'none',
    volume: 0.5,
  });

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 开始专注
  const startFocus = useCallback(() => {
    clearTimer();
    
    const now = Date.now();
    if (!startTimeRef.current) {
      startTimeRef.current = now;
    }

    setSession((prev) => ({
      ...prev,
      status: 'running',
      startTime: prev.startTime || new Date().toISOString(),
    }));

    // 启动倒计时
    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (prev.remainingTime <= 1) {
          // 时间到，完成会话
          clearTimer();
          const completedSession = {
            ...prev,
            remainingTime: 0,
            status: 'completed' as FocusStatus,
            endTime: new Date().toISOString(),
          };
          onSessionComplete?.(completedSession);
          return completedSession;
        }
        return {
          ...prev,
          remainingTime: prev.remainingTime - 1,
        };
      });
    }, 1000);
  }, [clearTimer, onSessionComplete]);

  // 暂停专注
  const pauseFocus = useCallback(() => {
    clearTimer();
    setSession((prev) => ({
      ...prev,
      status: 'paused',
    }));
  }, [clearTimer]);

  // 恢复专注
  const resumeFocus = useCallback(() => {
    startFocus();
  }, [startFocus]);

  // 停止/跳过专注
  const skipFocus = useCallback(() => {
    clearTimer();
    setSession((prev) => {
      const actualDuration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        : 0;

      // 记录会话日志
      if (onSessionLog && prev.startTime) {
        onSessionLog({
          taskId: prev.taskId,
          taskTitle: prev.taskTitle,
          plannedDuration: Math.floor(prev.duration / 60),
          actualDuration,
          completed: false,
          interruptions: prev.interruptions,
          ambientSound: prev.ambientSound,
          notes: '用户主动跳过',
        });
      }

      return {
        ...prev,
        status: 'idle',
        remainingTime: prev.duration,
        endTime: new Date().toISOString(),
      };
    });
    startTimeRef.current = null;
  }, [clearTimer, onSessionLog]);

  // 完成专注（正常完成）
  const completeFocus = useCallback(() => {
    clearTimer();
    setSession((prev) => {
      const actualDuration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        : Math.floor(prev.duration / 60);

      // 记录会话日志
      if (onSessionLog && prev.startTime) {
        onSessionLog({
          taskId: prev.taskId,
          taskTitle: prev.taskTitle,
          plannedDuration: Math.floor(prev.duration / 60),
          actualDuration,
          completed: true,
          interruptions: prev.interruptions,
          ambientSound: prev.ambientSound,
          notes: '正常完成',
        });
      }

      const completedSession = {
        ...prev,
        status: 'completed' as FocusStatus,
        remainingTime: 0,
        endTime: new Date().toISOString(),
      };

      onSessionComplete?.(completedSession);
      return completedSession;
    });
    startTimeRef.current = null;
  }, [clearTimer, onSessionComplete, onSessionLog]);

  // 重置专注会话
  const resetFocus = useCallback((preset: FocusPreset = 'pomodoro') => {
    clearTimer();
    startTimeRef.current = null;
    setSession({
      id: `session-${Date.now()}`,
      taskId: null,
      taskTitle: '',
      duration: PRESET_DURATIONS[preset],
      remainingTime: PRESET_DURATIONS[preset],
      status: 'idle',
      startTime: null,
      endTime: null,
      interruptions: 0,
      ambientSound: 'none',
      volume: 0.5,
    });
  }, [clearTimer]);

  // 设置专注时长
  const setDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setSession((prev) => ({
      ...prev,
      duration: seconds,
      remainingTime: seconds,
    }));
  }, []);

  // 选择任务
  const selectTask = useCallback((task: Task | null) => {
    setSession((prev) => ({
      ...prev,
      taskId: task?.id || null,
      taskTitle: task?.title || '',
    }));
  }, []);

  // 设置环境音效
  const setAmbientSound = useCallback((sound: AmbientSoundType) => {
    setSession((prev) => ({
      ...prev,
      ambientSound: sound,
    }));
  }, []);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    setSession((prev) => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  // 记录干扰
  const recordInterruption = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      interruptions: prev.interruptions + 1,
    }));
  }, []);

  // 格式化时间显示 mm:ss
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 计算进度百分比
  const getProgress = useCallback((): number => {
    if (session.duration === 0) return 0;
    return ((session.duration - session.remainingTime) / session.duration) * 100;
  }, [session.duration, session.remainingTime]);

  // 清理副作用
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    session,
    isRunning: session.status === 'running',
    isPaused: session.status === 'paused',
    isCompleted: session.status === 'completed',
    isIdle: session.status === 'idle',
    formattedTime: formatTime(session.remainingTime),
    progress: getProgress(),
    actions: {
      startFocus,
      pauseFocus,
      resumeFocus,
      skipFocus,
      completeFocus,
      resetFocus,
      setDuration,
      selectTask,
      setAmbientSound,
      setVolume,
      recordInterruption,
    },
  };
}
