"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Zap, Target, Rocket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "../types";

interface JustStartModeProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onSkip: () => void;
}

// 鼓励语句库
const encouragements = [
  "万事开头难，但一旦开始就已经成功了一半！",
  "小步骤带来大改变，你正在变得更强！",
  "专注当下，一个任务完成后，下一个会更轻松！",
  "每一次完成都是对自己承诺的兑现！",
  "你比自己想象的更有能力！",
  "行动起来，焦虑就会消失！",
  "完成这个任务，你就离目标更近一步！",
  "相信自己的选择，继续向前！",
  "每一个小胜利都值得庆祝！",
  "你正在培养一个强大的习惯！",
];

// 根据任务ID获取固定的鼓励语句（避免 hydration 不匹配）
function getEncouragementForTask(taskId: string | undefined): string {
  if (!taskId) return encouragements[0];
  // 使用任务ID的最后一个字符作为索引
  const index = taskId.charCodeAt(taskId.length - 1) % encouragements.length;
  return encouragements[index];
}

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: { opacity: 0, y: -20 },
};

// 庆祝动画变体
const celebrateVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

export function JustStartMode({
  isOpen,
  task,
  onClose,
  onComplete,
  onSkip,
}: JustStartModeProps) {
  const [encouragement, setEncouragement] = useState("");
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      // 只在客户端使用随机数，避免 hydration 不匹配
      setEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setIsCelebrating(false);
    }
  }, [isOpen, task?.id]);

  const handleComplete = () => {
    if (!task) return;
    setIsCelebrating(true);
    setTimeout(() => {
      onComplete(task.id);
      setIsCelebrating(false);
    }, 1500);
  };

  // 格式化预计时间
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}小时`;
    return `${hours}小时${remainingMinutes}分钟`;
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 z-10"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* 主内容 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 max-w-lg w-full mx-4 text-center"
          >
            {!isCelebrating ? (
              <>
                {/* 标签 */}
                <motion.div variants={itemVariants}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Just Start 模式
                  </span>
                </motion.div>

                {/* 模式标题 */}
                <motion.h2
                  variants={itemVariants}
                  className="mt-6 text-3xl font-bold"
                >
                  只关注这一个任务
                </motion.h2>

                {/* 鼓励语句 */}
                <motion.p
                  variants={itemVariants}
                  className="mt-3 text-muted-foreground"
                >
                  {encouragement}
                </motion.p>

                {/* 任务卡片 */}
                <motion.div
                  variants={itemVariants}
                  className={cn(
                    "mt-8 p-8 rounded-2xl border-2",
                    "bg-card shadow-xl",
                    "border-primary/20"
                  )}
                >
                  {/* 任务图标 */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  {/* 任务标题 */}
                  <h3 className="text-xl font-semibold">{task.title}</h3>

                  {/* 任务描述 */}
                  {task.description && (
                    <p className="mt-2 text-muted-foreground text-sm">
                      {task.description}
                    </p>
                  )}

                  {/* 任务信息 */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      预计 {formatTime(task.estimatedMinutes)}
                    </span>
                    {task.priority === "high" && (
                      <span className="text-rose-500">高优先级</span>
                    )}
                  </div>

                  {/* 大大的完成按钮 */}
                  <motion.div
                    className="mt-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-semibold gap-2"
                      onClick={handleComplete}
                    >
                      <CheckAnimation />
                      我做到了！
                    </Button>
                  </motion.div>
                </motion.div>

                {/* 跳过按钮 */}
                <motion.div variants={itemVariants} className="mt-6">
                  <Button variant="ghost" size="sm" onClick={onSkip}>
                    换一个任务
                  </Button>
                </motion.div>

                {/* 提示 */}
                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-xs text-muted-foreground"
                >
                  提示：Just Start 模式会在你有很多任务时自动推荐一个小任务开始
                </motion.p>
              </>
            ) : (
              /* 庆祝动画 */
              <motion.div
                variants={celebrateVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <motion.div
                    className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: 2,
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <Star className="w-16 h-16 text-emerald-500 fill-emerald-500" />
                    </motion.div>
                  </motion.div>
                  {/* 庆祝粒子效果 */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-emerald-400"
                      initial={{
                        x: 64,
                        y: 64,
                        scale: 0,
                      }}
                      animate={{
                        x: 64 + Math.cos((i * Math.PI) / 4) * 80,
                        y: 64 + Math.sin((i * Math.PI) / 4) * 80,
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.05,
                      }}
                    />
                  ))}
                </div>
                <h2 className="mt-8 text-2xl font-bold">太棒了！</h2>
                <p className="mt-2 text-muted-foreground">
                  你完成了一个任务，继续保持！
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 勾选动画组件
function CheckAnimation() {
  return (
    <motion.div
      initial={false}
      whileHover={{
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0],
      }}
      transition={{ duration: 0.5 }}
    >
      <Rocket className="w-5 h-5" />
    </motion.div>
  );
}
