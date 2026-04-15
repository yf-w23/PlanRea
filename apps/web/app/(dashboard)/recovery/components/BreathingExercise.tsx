"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

type BreathingPhase = "inhale" | "hold" | "exhale" | "idle";

const PHASE_CONFIG: Record<
  BreathingPhase,
  { label: string; duration: number; description: string; scale: number }
> = {
  idle: { label: "准备", duration: 0, description: "点击开始呼吸练习", scale: 1 },
  inhale: { label: "吸气", duration: 4, description: "用鼻子缓慢吸气", scale: 1.5 },
  hold: { label: "屏息", duration: 7, description: "保持呼吸，放松身体", scale: 1.5 },
  exhale: { label: "呼气", duration: 8, description: "用嘴缓慢呼气", scale: 1 },
};

export function BreathingExercise() {
  const [phase, setPhase] = useState<BreathingPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [totalCycles, setTotalCycles] = useState(0);

  const startExercise = useCallback(() => {
    setPhase("inhale");
    setTimeLeft(PHASE_CONFIG.inhale.duration);
    setCycleCount(0);
  }, []);

  const pauseExercise = useCallback(() => {
    setPhase("idle");
    setTimeLeft(0);
  }, []);

  const resetExercise = useCallback(() => {
    setPhase("idle");
    setTimeLeft(0);
    setCycleCount(0);
  }, []);

  useEffect(() => {
    if (phase === "idle" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && phase !== "idle") {
      // 过渡到下一个阶段
      switch (phase) {
        case "inhale":
          setPhase("hold");
          setTimeLeft(PHASE_CONFIG.hold.duration);
          break;
        case "hold":
          setPhase("exhale");
          setTimeLeft(PHASE_CONFIG.exhale.duration);
          break;
        case "exhale":
          setCycleCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= 4) {
              // 完成4个循环后自动停止
              setTimeout(() => {
                setPhase("idle");
                setTotalCycles((t) => t + 4);
              }, 500);
              return 0;
            }
            return newCount;
          });
          setPhase("inhale");
          setTimeLeft(PHASE_CONFIG.inhale.duration);
          break;
      }
    }
  }, [timeLeft, phase]);

  const progress =
    phase !== "idle" && PHASE_CONFIG[phase].duration > 0
      ? ((PHASE_CONFIG[phase].duration - timeLeft) / PHASE_CONFIG[phase].duration) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              呼吸练习
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              4-7-8 呼吸法
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-4 h-4 text-slate-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center py-8">
        {/* Outer rings */}
        <motion.div
          animate={{
            scale: PHASE_CONFIG[phase].scale,
            opacity: phase === "idle" ? 0.3 : 0.2,
          }}
          transition={{ duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5 }}
          className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-teal-200 to-sky-200 dark:from-teal-800 dark:to-sky-800"
        />
        <motion.div
          animate={{
            scale: PHASE_CONFIG[phase].scale * 0.85,
            opacity: phase === "idle" ? 0.4 : 0.3,
          }}
          transition={{ duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5 }}
          className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 dark:from-sky-800 dark:to-blue-800"
        />

        {/* Main circle */}
        <motion.div
          animate={{
            scale: PHASE_CONFIG[phase].scale * 0.7,
          }}
          transition={{ duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5 }}
          className="relative w-48 h-48 rounded-full bg-gradient-to-br from-teal-400 via-sky-400 to-blue-500 flex items-center justify-center shadow-lg"
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="289"
              animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Center content */}
          <div className="text-center text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-2xl font-bold">{PHASE_CONFIG[phase].label}</p>
                {phase !== "idle" && (
                  <p className="text-3xl font-light">{timeLeft}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Phase description */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
        {PHASE_CONFIG[phase].description}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {phase === "idle" ? (
          <button
            onClick={startExercise}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-sky-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-sky-600 transition-all shadow-md hover:shadow-lg"
          >
            <Play className="w-5 h-5" />
            开始练习
          </button>
        ) : (
          <>
            <button
              onClick={pauseExercise}
              className="flex items-center gap-2 px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <Pause className="w-5 h-5" />
              暂停
            </button>
            <button
              onClick={resetExercise}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              重置
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">当前循环</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {cycleCount} / 4
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-slate-600 dark:text-slate-400">今日完成</span>
          <span className="font-medium text-teal-600 dark:text-teal-400">
            {totalCycles} 轮
          </span>
        </div>
      </div>
    </motion.div>
  );
}
