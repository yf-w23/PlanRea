"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface WorkloadData {
  date: string;
  workload: number;
  energy: number;
  recovery: number;
}

interface WorkloadChartProps {
  workload: WorkloadData[];
}

export function WorkloadChart({ workload }: WorkloadChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationProgress(1), 300);
    return () => clearTimeout(timer);
  }, []);

  // 计算平均值和趋势
  const avgWorkload =
    workload.reduce((sum, d) => sum + d.workload, 0) / workload.length;
  const avgEnergy =
    workload.reduce((sum, d) => sum + d.energy, 0) / workload.length;
  const avgRecovery =
    workload.reduce((sum, d) => sum + d.recovery, 0) / workload.length;

  const lastThreeDays = workload.slice(-3);
  const recentTrend =
    lastThreeDays[2].workload - lastThreeDays[0].workload;

  // 生成警告
  const warnings = [];
  if (avgWorkload > 75) {
    warnings.push({
      type: "high-workload",
      message: "近期工作负荷较高，注意适当休息",
      severity: "high",
    });
  }
  if (avgRecovery < 50) {
    warnings.push({
      type: "low-recovery",
      message: "恢复时间不足，建议增加休息",
      severity: "high",
    });
  }
  if (avgEnergy < 60) {
    warnings.push({
      type: "low-energy",
      message: "精力水平偏低，关注睡眠质量",
      severity: "medium",
    });
  }

  const chartHeight = 200;
  const chartWidth = 100;
  const padding = { top: 10, bottom: 30, left: 10, right: 10 };

  const getPath = (data: number[]) => {
    const points = data.map((value, index) => {
      const x =
        padding.left +
        (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
      const y =
        chartHeight -
        padding.bottom -
        (value / 100) * (chartHeight - padding.top - padding.bottom);
      return { x, y };
    });

    // 生成平滑曲线
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const workloadPath = getPath(workload.map((d) => d.workload));
  const energyPath = getPath(workload.map((d) => d.energy));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              工作负载趋势
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              最近7天数据分析
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            {workload[0]?.date} - {workload[workload.length - 1]?.date}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500">平均负荷</span>
            {recentTrend > 0 ? (
              <TrendingUp className="w-3 h-3 text-rose-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-emerald-500" />
            )}
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {avgWorkload.toFixed(0)}%
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <span className="text-xs text-slate-500 block mb-1">平均精力</span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {avgEnergy.toFixed(0)}%
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
          <span className="text-xs text-slate-500 block mb-1">恢复指数</span>
          <span
            className={`text-xl font-bold ${
              avgRecovery >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : avgRecovery >= 50
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {avgRecovery.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-56 mb-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y =
              chartHeight -
              padding.bottom -
              (tick / 100) * (chartHeight - padding.top - padding.bottom);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-slate-500"
                />
                <text
                  x={padding.left - 2}
                  y={y + 2}
                  textAnchor="end"
                  fontSize="4"
                  fill="currentColor"
                  className="text-slate-400"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Workload line */}
          <motion.path
            d={workloadPath}
            fill="none"
            stroke="url(#workloadGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animationProgress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Energy line */}
          <motion.path
            d={energyPath}
            fill="none"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4,2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animationProgress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="workloadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {workload.map((d, i) => {
            const x =
              padding.left +
              (i / (workload.length - 1)) *
                (chartWidth - padding.left - padding.right);
            const workloadY =
              chartHeight -
              padding.bottom -
              (d.workload / 100) *
                (chartHeight - padding.top - padding.bottom);
            const energyY =
              chartHeight -
              padding.bottom -
              (d.energy / 100) *
                (chartHeight - padding.top - padding.bottom);

            return (
              <g key={i}>
                <motion.circle
                  cx={x}
                  cy={workloadY}
                  r={hoveredDay === i ? 4 : 3}
                  fill="#f59e0b"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 1 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
                <motion.circle
                  cx={x}
                  cy={energyY}
                  r={hoveredDay === i ? 4 : 3}
                  fill="#10b981"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 1.2 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {workload.map((d, i) => {
            const x =
              padding.left +
              (i / (workload.length - 1)) *
                (chartWidth - padding.left - padding.right);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 5}
                textAnchor="middle"
                fontSize="4"
                fill="currentColor"
                className={`${
                  hoveredDay === i
                    ? "text-slate-700 dark:text-slate-200 font-medium"
                    : "text-slate-400"
                }`}
              >
                {d.date.slice(5)}
              </text>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg p-3 text-sm border border-slate-200 dark:border-slate-600"
          >
            <p className="font-medium text-slate-800 dark:text-slate-100 mb-1">
              {workload[hoveredDay].date}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  负荷: {workload[hoveredDay].workload}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  精力: {workload[hoveredDay].energy}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-0.5 bg-gradient-to-r from-amber-500 to-rose-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            工作负荷
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 border-dashed" />
          <span className="text-sm text-slate-600 dark:text-slate-400">精力水平</span>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <motion.div
              key={warning.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-2 p-3 rounded-lg ${
                warning.severity === "high"
                  ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900"
                  : "bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900"
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  warning.severity === "high"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
              <p
                className={`text-sm ${
                  warning.severity === "high"
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {warning.message}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {warnings.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            你的工作和休息平衡得很好，继续保持！
          </p>
        </div>
      )}
    </motion.div>
  );
}
