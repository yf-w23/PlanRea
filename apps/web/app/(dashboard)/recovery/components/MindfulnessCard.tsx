"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Play, Pause, Volume2, VolumeX, Clock } from "lucide-react";

const DURATION_OPTIONS = [
  { value: 3, label: "3分钟", description: "快速放松" },
  { value: 5, label: "5分钟", description: "深度休息" },
  { value: 10, label: "10分钟", description: "完全恢复" },
  { value: 15, label: "15分钟", description: "深度冥想" },
];

const GUIDED_MESSAGES = [
  "找一个舒适的姿势，轻轻闭上眼睛...",
  "感受你的身体与座椅的接触...",
  "将注意力集中在呼吸上...",
  "吸气时，感受空气进入你的身体...",
  "呼气时，释放所有的紧张和担忧...",
  "如果你的思绪飘走，温柔地将它带回来...",
  "感受此刻的平静与安宁...",
  "你是一个完整而美好的存在...",
  "你的价值不取决于你的成就...",
  "允许自己休息，这是爱的表现...",
  "每一次呼吸都在滋养你的身心...",
  "感受身体每一个部位的放松...",
];

const AMBIENT_SOUNDS = [
  { id: "none", name: "静音", emoji: "🔇" },
  { id: "rain", name: "雨声", emoji: "🌧️" },
  { id: "forest", name: "森林", emoji: "🌲" },
  { id: "ocean", name: "海浪", emoji: "🌊" },
  { id: "wind", name: "微风", emoji: "🍃" },
];

export function MindfulnessCard() {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [selectedSound, setSelectedSound] = useState("rain");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setCompletedSessions((c) => c + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 更新引导语
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % GUIDED_MESSAGES.length);
      }, 25000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearInterval(messageInterval);
      };
    }
  }, [isPlaying, timeLeft]);

  const startMeditation = () => {
    setTimeLeft(selectedDuration * 60);
    setIsPlaying(true);
    setCurrentMessageIndex(0);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setTimeLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeLeft > 0 ? ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              正念冥想
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              引导式放松
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

      {/* Duration Selection */}
      {!isPlaying && timeLeft === 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            选择时长
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDuration(option.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedDuration === option.value
                    ? "bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500"
                    : "bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${
                    selectedDuration === option.value
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-slate-500"
                  }`} />
                  <span className={`font-medium ${
                    selectedDuration === option.value
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {option.label}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  selectedDuration === option.value
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ambient Sound Selection */}
      {!isPlaying && timeLeft === 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            背景音效
          </label>
          <div className="flex flex-wrap gap-2">
            {AMBIENT_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(sound.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedSound === sound.id
                    ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {sound.emoji} {sound.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meditation Display */}
      {(isPlaying || timeLeft > 0) && (
        <div className="mb-6">
          {/* Progress bar */}
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-violet-400 to-purple-500"
            />
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <motion.div
              key={timeLeft}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-light text-slate-800 dark:text-slate-100"
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>

          {/* Guided Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800"
            >
              <p className="text-center text-violet-800 dark:text-violet-300 italic">
                "{GUIDED_MESSAGES[currentMessageIndex]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isPlaying && timeLeft === 0 ? (
          <button
            onClick={startMeditation}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg w-full justify-center"
          >
            <Play className="w-5 h-5" />
            开始冥想
          </button>
        ) : (
          <>
            {isPlaying ? (
              <button
                onClick={pauseMeditation}
                className="flex items-center gap-2 px-6 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <Pause className="w-5 h-5" />
                暂停
              </button>
            ) : (
              <button
                onClick={startMeditation}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-600 transition-colors"
              >
                <Play className="w-5 h-5" />
                继续
              </button>
            )}
            <button
              onClick={resetMeditation}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              结束
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">今日完成</span>
          <span className="font-medium text-violet-600 dark:text-violet-400">
            {completedSessions} 次
          </span>
        </div>
      </div>
    </motion.div>
  );
}
