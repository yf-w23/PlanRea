"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Footprints,
  Dumbbell,
  Droplets,
  Bed,
  Music,
  Eye,
  Timer,
  Bell,
  CheckCircle,
} from "lucide-react";

interface SuggestedBreakProps {
  stressLevel: "low" | "medium" | "high";
}

interface BreakActivity {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  forStressLevels: ("low" | "medium" | "high")[];
  color: string;
  bgColor: string;
}

const BREAK_ACTIVITIES: BreakActivity[] = [
  {
    id: "water",
    name: "喝水休息",
    description: "补充水分，滋润身体",
    icon: Droplets,
    duration: "2分钟",
    forStressLevels: ["low", "medium", "high"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "eyes",
    name: "眼保健操",
    description: "远眺放松，缓解眼疲劳",
    icon: Eye,
    duration: "5分钟",
    forStressLevels: ["low", "medium", "high"],
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: "walk",
    name: "散步活动",
    description: "室内走动，促进血液循环",
    icon: Footprints,
    duration: "10分钟",
    forStressLevels: ["medium", "high"],
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "stretch",
    name: "简单伸展",
    description: "舒展筋骨，放松肌肉",
    icon: Dumbbell,
    duration: "10分钟",
    forStressLevels: ["medium", "high"],
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    id: "music",
    name: "听听音乐",
    description: "轻松旋律，舒缓心情",
    icon: Music,
    duration: "15分钟",
    forStressLevels: ["medium", "high"],
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    id: "coffee",
    name: "茶歇时光",
    description: "泡杯茶或咖啡，小憩片刻",
    icon: Coffee,
    duration: "15分钟",
    forStressLevels: ["medium", "high"],
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    id: "nap",
    name: "小憩一会儿",
    description: "20分钟强力小睡",
    icon: Bed,
    duration: "20分钟",
    forStressLevels: ["high"],
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
];

export function SuggestedBreak({ stressLevel }: SuggestedBreakProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [reminderSet, setReminderSet] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const recommendedActivities = BREAK_ACTIVITIES.filter((activity) =>
    activity.forStressLevels.includes(stressLevel)
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setReminderSet(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSetReminder = (activity: BreakActivity) => {
    const durationMinutes = parseInt(activity.duration);
    setCountdown(durationMinutes * 60);
    setReminderSet(true);
    setSelectedActivity(activity.id);
  };

  const handleCompleteActivity = (activityId: string) => {
    setCompletedActivities((prev) => [...prev, activityId]);
    setReminderSet(false);
    setCountdown(0);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStressMessage = () => {
    switch (stressLevel) {
      case "low":
        return "你的状态不错！做一些简单的休息活动保持吧~";
      case "medium":
        return "你已连续工作一段时间，建议选择一项活动放松一下";
      case "high":
        return "你的疲劳度较高，强烈建议停下来休息一下";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            休息建议
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            为你推荐的恢复活动
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-100 dark:border-teal-900 mb-4">
        <p className="text-sm text-teal-800 dark:text-teal-300">
          {getStressMessage()}
        </p>
      </div>

      {/* Countdown Banner */}
      <AnimatePresence>
        {reminderSet && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span className="font-medium">休息倒计时</span>
              </div>
              <span className="text-2xl font-bold">{formatCountdown(countdown)}</span>
            </div>
            <p className="text-sm text-violet-100 mt-1">
              时间到了会提醒你回来继续工作
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recommendedActivities.map((activity) => {
          const Icon = activity.icon;
          const isCompleted = completedActivities.includes(activity.id);
          const isSelected = selectedActivity === activity.id;

          return (
            <motion.div
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isCompleted
                  ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60"
                  : isSelected
                  ? "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700"
                  : `${activity.bgColor} border-transparent hover:shadow-md`
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100">
                      {activity.name}
                    </h4>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-white dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400">
                      {activity.duration}
                    </span>
                  </div>
                </div>
              </div>

              {!isCompleted && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleSetReminder(activity)}
                    disabled={reminderSet && isSelected}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reminderSet && isSelected
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {reminderSet && isSelected ? "已设置" : "设提醒"}
                  </button>
                  <button
                    onClick={() => handleCompleteActivity(activity.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    完成
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">今日完成</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {completedActivities.length} / {recommendedActivities.length}
          </span>
        </div>
        <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${
                (completedActivities.length / recommendedActivities.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
