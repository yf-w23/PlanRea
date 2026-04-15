"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

interface StressMetrics {
  workloadScore: number;
  completionRate: number;
  continuousWorkHours: number;
  fatigueLevel: "low" | "medium" | "high";
}

export function StressDetector() {
  const [metrics, setMetrics] = useState<StressMetrics>({
    workloadScore: 0,
    completionRate: 0,
    continuousWorkHours: 0,
    fatigueLevel: "low",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // 模拟分析过程
    const timer = setTimeout(() => {
      // 压力检测算法：
      // 1. 工作量分数 = 近期任务数 × 平均任务复杂度 / 可用时间
      // 2. 完成率 = 已完成任务 / 总任务 × 100%
      // 3. 连续工作时长 = 当前时间 - 上次休息时间
      // 4. 疲劳等级 = f(工作量分数, 完成率, 连续工作时长)
      
      const mockMetrics: StressMetrics = {
        workloadScore: Math.floor(Math.random() * 40) + 60, // 60-100
        completionRate: Math.floor(Math.random() * 30) + 60, // 60-90%
        continuousWorkHours: parseFloat((Math.random() * 4 + 1).toFixed(1)), // 1-5小时
        fatigueLevel: "medium",
      };

      // 计算疲劳等级
      mockMetrics.fatigueLevel = calculateFatigueLevel(mockMetrics);
      setMetrics(mockMetrics);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const calculateFatigueLevel = (m: StressMetrics): "low" | "medium" | "high" => {
    let score = 0;
    // 工作量分数权重 40%
    score += (m.workloadScore / 100) * 40;
    // 完成率权重 30%（反向，完成率低则压力高）
    score += ((100 - m.completionRate) / 100) * 30;
    // 连续工作时长权重 30%
    score += Math.min(m.continuousWorkHours / 6, 1) * 30;

    if (score < 35) return "low";
    if (score < 65) return "medium";
    return "high";
  };

  const getFatigueConfig = (level: "low" | "medium" | "high") => {
    const configs = {
      low: {
        color: "emerald",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        textColor: "text-emerald-700 dark:text-emerald-400",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        icon: CheckCircle,
        label: "状态良好",
        message: "你的状态很棒！保持当前节奏，适当休息。",
      },
      medium: {
        color: "amber",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        textColor: "text-amber-700 dark:text-amber-400",
        borderColor: "border-amber-200 dark:border-amber-800",
        icon: Info,
        label: "轻度疲劳",
        message: "你已连续工作一段时间，建议稍作休息。",
      },
      high: {
        color: "rose",
        bgColor: "bg-rose-50 dark:bg-rose-950/30",
        textColor: "text-rose-700 dark:text-rose-400",
        borderColor: "border-rose-200 dark:border-rose-800",
        icon: AlertCircle,
        label: "需要休息",
        message: "你的疲劳度较高，强烈建议停下来休息一下。",
      },
    };
    return configs[level];
  };

  const config = getFatigueConfig(metrics.fatigueLevel);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              当前状态评估
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              实时压力检测
            </p>
          </div>
        </div>
        {isAnalyzing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full"
          />
        )}
      </div>

      {isAnalyzing ? (
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Fatigue Level Card */}
          <div
            className={`p-4 rounded-xl ${config.bgColor} ${config.borderColor} border`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-6 h-6 ${config.textColor}`} />
              <span className={`font-semibold ${config.textColor}`}>
                {config.label}
              </span>
            </div>
            <p className={`text-sm ${config.textColor} opacity-90`}>
              {config.message}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Workload Score */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  工作量负荷
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {metrics.workloadScore}
                </span>
                <span className="text-sm text-slate-500 mb-1">/100</span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.workloadScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    metrics.workloadScore > 80
                      ? "bg-rose-500"
                      : metrics.workloadScore > 60
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Completion Rate */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  近期完成率
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {metrics.completionRate}
                </span>
                <span className="text-sm text-slate-500 mb-1">%</span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.completionRate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    metrics.completionRate > 80
                      ? "bg-emerald-500"
                      : metrics.completionRate > 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </div>
            </div>

            {/* Continuous Work Hours */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  连续工作
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {metrics.continuousWorkHours}
                </span>
                <span className="text-sm text-slate-500 mb-1">小时</span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metrics.continuousWorkHours / 6) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    metrics.continuousWorkHours > 4
                      ? "bg-rose-500"
                      : metrics.continuousWorkHours > 2
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
