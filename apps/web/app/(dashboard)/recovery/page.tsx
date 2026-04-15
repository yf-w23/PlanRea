"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Wind,
  Brain,
  Gamepad2,
  Coffee,
  TrendingUp,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";
import { StressDetector } from "./components/StressDetector";
import { BreathingExercise } from "./components/BreathingExercise";
import { MindfulnessCard } from "./components/MindfulnessCard";
import { MiniGameCard } from "./components/MiniGameCard";
import { SuggestedBreak } from "./components/SuggestedBreak";
import { WorkloadChart } from "./components/WorkloadChart";
import { useRecovery } from "./hooks/useRecovery";

const greetingMessages = [
  "你做得很好，现在让自己休息一下 💚",
  "休息一下是为了更好地前行 🌱",
  "你的努力值得被温柔对待 ✨",
  "深呼吸，放松你的身心 🌸",
  "照顾自己是生产力的一部分 🌿",
  "给自己一个温柔的拥抱 🤗",
  "此刻，只专注于当下的平静 🍃",
];

export default function RecoveryPage() {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "stats">("overview");
  const { stressLevel, recommendations, workload, refreshData } = useRecovery();

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetingMessages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 5 && currentHour < 12;
  const isAfternoon = currentHour >= 12 && currentHour < 18;
  const timeIcon = isMorning ? Sun : isAfternoon ? Sun : Moon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-teal-100 dark:border-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  恢复模式
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Recovery Mode
                </p>
              </div>
            </div>
            <button
              onClick={refreshData}
              className="p-2 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
              title="刷新状态"
            >
              <RotateCcw className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-6 rounded-3xl bg-gradient-to-r from-teal-100/50 via-emerald-100/50 to-cyan-100/50 dark:from-teal-900/20 dark:via-emerald-900/20 dark:to-cyan-900/20 border border-teal-200/50 dark:border-teal-800/50"
          >
            <motion.div
              key={greetingIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-2"
            >
              {(() => {
                const Icon = timeIcon;
                return <Icon className="w-6 h-6 text-amber-500" />;
              })()}
              <span className="text-lg text-slate-600 dark:text-slate-400">
                {isMorning
                  ? "早安"
                  : isAfternoon
                  ? "午安"
                  : "晚安"}
                ，
                {new Date().toLocaleDateString("zh-CN", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </span>
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={greetingIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent"
              >
                {greetingMessages[greetingIndex]}
              </motion.h2>
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            {[
              { id: "overview", label: "状态总览", icon: Sparkles },
              { id: "activities", label: "恢复活动", icon: Wind },
              { id: "stats", label: "数据分析", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Top Row: Stress Detector & Suggested Break */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StressDetector />
                <SuggestedBreak stressLevel={stressLevel} />
              </div>

              {/* Middle Row: Activity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <BreathingExercise />
                <MindfulnessCard />
                <MiniGameCard />
              </div>
            </motion.div>
          )}

          {activeTab === "activities" && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <BreathingExercise />
                <MindfulnessCard />
                <MiniGameCard />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SuggestedBreak stressLevel={stressLevel} />
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <WorkloadChart workload={workload} />
                </div>
                <div className="space-y-6">
                  <StressDetector />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Tips */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-900">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              恢复小贴士
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-700 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <Coffee className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>每工作90分钟，休息15-20分钟，让大脑得到充分恢复</span>
              </div>
              <div className="flex items-start gap-2">
                <Wind className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>深呼吸可以增加大脑供氧量，提升专注力和创造力</span>
              </div>
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>正念冥想可以降低皮质醇水平，减少压力和焦虑</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
