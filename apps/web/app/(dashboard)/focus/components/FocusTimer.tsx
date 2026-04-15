'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FocusPreset, FocusSession } from '../types';

// 预设配置
const PRESETS: { id: FocusPreset; label: string; minutes: number; description: string }[] = [
  { id: 'pomodoro', label: '番茄钟', minutes: 25, description: '25分钟专注 + 5分钟休息' },
  { id: 'deep', label: '深度专注', minutes: 50, description: '50分钟深度工作' },
  { id: 'custom', label: '自定义', minutes: 25, description: '自定义时长' },
];

interface FocusTimerProps {
  session: FocusSession;
  formattedTime: string;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onDurationChange: (minutes: number) => void;
  onReset: () => void;
}

export function FocusTimer({
  session,
  formattedTime,
  progress,
  isRunning,
  isPaused,
  isIdle,
  isCompleted,
  onStart,
  onPause,
  onResume,
  onSkip,
  onComplete,
  onDurationChange,
  onReset,
}: FocusTimerProps) {
  const [customMinutes, setCustomMinutes] = useState(25);
  const [selectedPreset, setSelectedPreset] = useState<FocusPreset>('pomodoro');

  // 处理预设选择
  const handlePresetSelect = (preset: FocusPreset) => {
    setSelectedPreset(preset);
    const minutes = preset === 'custom' ? customMinutes : PRESETS.find(p => p.id === preset)?.minutes || 25;
    onDurationChange(minutes);
  };

  // 处理自定义时长变化
  const handleCustomDurationChange = (minutes: number) => {
    setCustomMinutes(minutes);
    if (selectedPreset === 'custom') {
      onDurationChange(minutes);
    }
  };

  // 计算进度环参数
  const radius = 140;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* 进度环和计时器 */}
      <div className="relative">
        {/* 外圈背景 */}
        <svg
          width={radius * 2}
          height={radius * 2}
          className="transform -rotate-90"
        >
          {/* 背景圆环 */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-muted/20"
          />
          {/* 进度圆环 */}
          <motion.circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={cn(
              'transition-colors duration-500',
              isRunning && 'text-primary',
              isPaused && 'text-amber-500',
              isCompleted && 'text-green-500',
              isIdle && 'text-muted-foreground'
            )}
            style={{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset,
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </svg>

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* 时间显示 */}
          <motion.div
            className="text-7xl font-bold tabular-nums tracking-tight"
            animate={{
              scale: isRunning ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isRunning ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            {formattedTime}
          </motion.div>

          {/* 状态标签 */}
          <div className="mt-2 text-sm text-muted-foreground">
            {isIdle && '准备开始'}
            {isRunning && '专注中...'}
            {isPaused && '已暂停'}
            {isCompleted && '已完成！'}
          </div>

          {/* 任务标题 */}
          {session.taskTitle && (
            <div className="mt-4 max-w-[200px] text-center">
              <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full truncate max-w-full">
                {session.taskTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 预设选择器 - 仅在空闲状态显示 */}
      {isIdle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedPreset === preset.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 自定义时长滑块 */}
          {selectedPreset === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-4"
            >
              <span className="text-sm text-muted-foreground">时长:</span>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={customMinutes}
                onChange={(e) => handleCustomDurationChange(Number(e.target.value))}
                className="w-48 accent-primary"
              />
              <span className="text-sm font-medium w-12">{customMinutes}分</span>
            </motion.div>
          )}

          <p className="text-xs text-muted-foreground">
            {PRESETS.find(p => p.id === selectedPreset)?.description}
          </p>
        </motion.div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center gap-4">
        {/* 重置按钮 */}
        {!isIdle && (
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="h-12 w-12 rounded-full"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}

        {/* 主要控制按钮 */}
        {isIdle ? (
          <Button
            size="lg"
            onClick={onStart}
            className="h-16 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Play className="h-6 w-6 mr-2" />
            开始专注
          </Button>
        ) : isCompleted ? (
          <Button
            size="lg"
            onClick={onReset}
            className="h-16 px-8 rounded-full text-lg bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-6 w-6 mr-2" />
            完成
          </Button>
        ) : isRunning ? (
          <Button
            size="lg"
            variant="outline"
            onClick={onPause}
            className="h-16 px-8 rounded-full text-lg"
          >
            <Pause className="h-6 w-6 mr-2" />
            暂停
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onResume}
            className="h-16 px-8 rounded-full text-lg"
          >
            <Play className="h-6 w-6 mr-2" />
            继续
          </Button>
        )}

        {/* 跳过/完成按钮 */}
        {!isIdle && !isCompleted && (
          <Button
            variant="outline"
            size="icon"
            onClick={isRunning ? onComplete : onSkip}
            className="h-12 w-12 rounded-full"
          >
            {isRunning ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <SkipForward className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* 提示文字 */}
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {isIdle && '选择一个任务，开始你的专注时光'}
        {isRunning && '保持专注，不要分心'}
        {isPaused && '休息片刻，然后继续'}
        {isCompleted && '太棒了！你完成了一次专注训练'}
      </p>
    </div>
  );
}
