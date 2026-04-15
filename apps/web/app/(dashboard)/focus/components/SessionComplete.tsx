'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Clock, Target, Coffee, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FocusSession, Task } from '../types';

interface SessionCompleteProps {
  session: FocusSession;
  onStartBreak: () => void;
  onStartNextTask: (task: Task) => void;
  onRestart: () => void;
  upcomingTasks: Task[];
}

// 彩纸动画组件
function Confetti() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    color: string;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${particle.x}%`,
            top: -20,
            backgroundColor: particle.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: particle.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function SessionComplete({
  session,
  onStartBreak,
  onStartNextTask,
  onRestart,
  upcomingTasks,
}: SessionCompleteProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  // 5秒后停止彩纸动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // 计算实际专注时长
  const actualMinutes = Math.floor((session.duration - session.remainingTime) / 60);
  const plannedMinutes = Math.floor(session.duration / 60);

  // 获取鼓励语
  const getEncouragement = () => {
    if (actualMinutes >= plannedMinutes) {
      return '完美完成！你的专注力令人敬佩！';
    } else if (actualMinutes >= plannedMinutes * 0.8) {
      return '做得很好！继续保持！';
    } else {
      return '每一次专注都是进步！';
    }
  };

  // 获取休息建议
  const getBreakSuggestion = () => {
    if (plannedMinutes <= 25) {
      return { time: '5分钟', activity: '喝水、伸展、远眺' };
    } else if (plannedMinutes <= 50) {
      return { time: '10分钟', activity: '走动、休息眼睛、深呼吸' };
    } else {
      return { time: '15分钟', activity: '彻底放松，远离屏幕' };
    }
  };

  const breakSuggestion = getBreakSuggestion();

  return (
    <>
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4"
          >
            <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            专注完成！
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h2>

          <p className="text-muted-foreground text-lg">{getEncouragement()}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{actualMinutes}</p>
              <p className="text-xs text-muted-foreground">专注分钟</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{session.interruptions}</p>
              <p className="text-xs text-muted-foreground">分心次数</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Coffee className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{breakSuggestion.time}</p>
              <p className="text-xs text-muted-foreground">建议休息</p>
            </CardContent>
          </Card>
        </div>

        {/* 休息建议 */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">休息建议</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  建议休息 {breakSuggestion.time}，可以进行以下活动：
                </p>
                <p className="text-sm font-medium">{breakSuggestion.activity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 下一个任务推荐 */}
        {upcomingTasks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              继续专注下一个任务？
            </h3>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 3).map((task, index) => (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => onStartNextTask(task)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-card border hover:border-primary hover:shadow-md transition-all text-left group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    {task.estimatedMinutes && (
                      <p className="text-xs text-muted-foreground">
                        预计 {task.estimatedMinutes} 分钟
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            再来一次
          </Button>

          <Button
            onClick={onStartBreak}
            className="flex-1"
          >
            <Coffee className="h-4 w-4 mr-2" />
            开始休息
          </Button>
        </div>
      </motion.div>
    </>
  );
}
