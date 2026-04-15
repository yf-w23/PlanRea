"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy } from "lucide-react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

interface BubblePopProps {
  onComplete?: () => void;
}

const BUBBLE_COLORS = [
  "from-cyan-300 to-blue-400",
  "from-teal-300 to-emerald-400",
  "from-violet-300 to-purple-400",
  "from-pink-300 to-rose-400",
  "from-amber-300 to-orange-400",
];

export function BubblePop({ onComplete }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [poppedCount, setPoppedCount] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bubbleIdRef = useRef(0);

  const createBubble = useCallback(() => {
    const newBubble: Bubble = {
      id: bubbleIdRef.current++,
      x: Math.random() * 80 + 10, // 10% - 90% 位置
      y: 110, // 从底部下方开始
      size: Math.random() * 20 + 30, // 30-50px
      speed: Math.random() * 0.3 + 0.2, // 上升速度
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    };
    setBubbles((prev) => [...prev, newBubble]);
  }, []);

  const popBubble = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((prev) => prev + 10);
    setPoppedCount((prev) => prev + 1);
  }, []);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setPoppedCount(0);
    setBubbles([]);
  }, []);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setScore(0);
    setTimeLeft(60);
    setPoppedCount(0);
    setBubbles([]);
    onComplete?.();
  }, [onComplete]);

  // 游戏主循环
  useEffect(() => {
    if (!isPlaying) return;

    // 生成气泡
    const spawnInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        createBubble();
      }
    }, 800);

    // 倒计时
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 更新气泡位置
    const moveInterval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((bubble) => ({
            ...bubble,
            y: bubble.y - bubble.speed,
          }))
          .filter((bubble) => bubble.y > -10) // 移除超出屏幕的气泡
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      clearInterval(moveInterval);
    };
  }, [isPlaying, createBubble]);

  const getFeedbackMessage = () => {
    if (poppedCount >= 30) return "太棒了！你的反应真快！🎉";
    if (poppedCount >= 20) return "做得不错！继续保持！👍";
    if (poppedCount >= 10) return "不错的开始，再试一次？💪";
    return "慢慢来，享受这个过程~ 🌸";
  };

  return (
    <div className="relative">
      {/* Game Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {score}
            </span>
          </div>
          <div className="text-sm text-slate-500">
            已戳破: {poppedCount}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative h-64 rounded-xl bg-gradient-to-b from-sky-100 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/20 overflow-hidden border border-sky-200 dark:border-sky-900"
      >
        {!isPlaying && timeLeft === 60 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-center px-4">
              点击飘动的泡泡来戳破它们<br />
              配合呼吸节奏，放松身心
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md"
            >
              <Play className="w-5 h-5" />
              开始游戏
            </button>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              游戏结束!
            </p>
            <p className="text-lg text-cyan-600 dark:text-cyan-400 mb-1">
              得分: {score}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {getFeedbackMessage()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                再玩一次
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        )}

        {/* Bubbles */}
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => popBubble(bubble.id)}
              className={`absolute rounded-full bg-gradient-to-br ${bubble.color} shadow-lg cursor-pointer hover:brightness-110 transition-all`}
              style={{
                left: `${bubble.x}%`,
                bottom: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
              }}
            >
              {/* Bubble shine effect */}
              <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-white/40" />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Breathing hint */}
        {isPlaying && (
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-xs text-sky-600 dark:text-sky-400">
              配合呼吸：吸气时准备，呼气时戳破泡泡
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900">
        <p className="text-xs text-sky-700 dark:text-sky-400">
          💡 提示: 这个游戏配合4-7-8呼吸法效果更佳。吸气4秒时观察泡泡，
          屏息7秒时瞄准，呼气8秒时戳破。
        </p>
      </div>
    </div>
  );
}
