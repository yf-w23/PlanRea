"use client";

import { useState, useEffect, useCallback } from "react";

export interface WorkloadData {
  date: string;
  workload: number;
  energy: number;
  recovery: number;
}

export interface Activity {
  id: string;
  type: "breathing" | "mindfulness" | "game" | "break";
  name: string;
  duration: number;
  priority: number;
  reason: string;
}

export function useRecovery() {
  const [stressLevel, setStressLevel] = useState<"low" | "medium" | "high">("medium");
  const [workload, setWorkload] = useState<WorkloadData[]>([]);
  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 压力检测算法
  const detectStressLevel = useCallback((): "low" | "medium" | "high" => {
    // 获取最近的工作数据
    const recentWorkload = workload.slice(-3);
    if (recentWorkload.length === 0) return "medium";

    // 计算各项指标
    const avgWorkload =
      recentWorkload.reduce((sum, d) => sum + d.workload, 0) /
      recentWorkload.length;
    const avgEnergy =
      recentWorkload.reduce((sum, d) => sum + d.energy, 0) /
      recentWorkload.length;
    const avgRecovery =
      recentWorkload.reduce((sum, d) => sum + d.recovery, 0) /
      recentWorkload.length;

    // 压力检测算法
    // 权重分配：
    // - 工作负荷 35%
    // - 精力水平 30%
    // - 恢复指数 25%
    // - 趋势变化 10%
    let stressScore = 0;

    // 工作负荷评分 (0-35)
    stressScore += (avgWorkload / 100) * 35;

    // 精力水平评分 (反向，0-30)
    stressScore += ((100 - avgEnergy) / 100) * 30;

    // 恢复指数评分 (反向，0-25)
    stressScore += ((100 - avgRecovery) / 100) * 25;

    // 趋势变化 (0-10)
    if (recentWorkload.length >= 2) {
      const trend =
        recentWorkload[recentWorkload.length - 1].workload -
        recentWorkload[0].workload;
      stressScore += Math.max(0, (trend / 100) * 10);
    }

    // 判断压力等级
    if (stressScore < 35) return "low";
    if (stressScore < 60) return "medium";
    return "high";
  }, [workload]);

  // 推荐活动算法
  const generateRecommendations = useCallback((): Activity[] => {
    const currentLevel = detectStressLevel();
    const activities: Activity[] = [];

    // 基于疲劳等级的推荐算法
    const recommendationMatrix = {
      low: [
        {
          type: "breathing" as const,
          name: "深呼吸练习",
          duration: 3,
          priority: 1,
          reason: "保持良好状态，预防疲劳",
        },
        {
          type: "break" as const,
          name: "短暂休息",
          duration: 5,
          priority: 2,
          reason: "活动一下身体",
        },
      ],
      medium: [
        {
          type: "breathing" as const,
          name: "4-7-8呼吸法",
          duration: 5,
          priority: 1,
          reason: "缓解轻度疲劳，恢复专注力",
        },
        {
          type: "mindfulness" as const,
          name: "正念冥想",
          duration: 5,
          priority: 2,
          reason: "放松大脑，减轻压力",
        },
        {
          type: "game" as const,
          name: "呼吸泡泡",
          duration: 3,
          priority: 3,
          reason: "轻松游戏，转移注意力",
        },
        {
          type: "break" as const,
          name: "伸展运动",
          duration: 10,
          priority: 4,
          reason: "放松肌肉，缓解僵硬",
        },
      ],
      high: [
        {
          type: "breathing" as const,
          name: "深度呼吸",
          duration: 10,
          priority: 1,
          reason: "紧急缓解高压力状态",
        },
        {
          type: "mindfulness" as const,
          name: "引导式冥想",
          duration: 10,
          priority: 2,
          reason: "深度放松，平复情绪",
        },
        {
          type: "break" as const,
          name: "小憩休息",
          duration: 20,
          priority: 3,
          reason: "强烈建议暂停工作",
        },
        {
          type: "game" as const,
          name: "记忆翻牌",
          duration: 5,
          priority: 4,
          reason: "轻度活动，但不沉迷",
        },
      ],
    };

    const recommended = recommendationMatrix[currentLevel];

    // 添加ID并排序
    recommended.forEach((rec, index) => {
      activities.push({
        id: `rec-${index}`,
        ...rec,
      });
    });

    // 根据工作数据分析个性化推荐
    if (workload.length > 0) {
      const recentWorkload = workload.slice(-3);
      const avgWorkload =
        recentWorkload.reduce((sum, d) => sum + d.workload, 0) /
        recentWorkload.length;

      // 如果工作负荷持续高，增加额外提醒
      if (avgWorkload > 80) {
        activities.unshift({
          id: "urgent-break",
          type: "break",
          name: "紧急休息",
          duration: 15,
          priority: 0,
          reason: "连续高负荷工作，必须休息",
        });
      }
    }

    return activities.sort((a, b) => a.priority - b.priority);
  }, [detectStressLevel, workload]);

  // 生成模拟数据
  const generateMockData = useCallback(() => {
    const today = new Date();
    const mockWorkload: WorkloadData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 模拟工作日和周末的差异
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // 生成有趋势的随机数据
      const baseWorkload = isWeekend ? 30 : 60 + Math.random() * 30;
      const baseEnergy = isWeekend ? 75 : 50 + Math.random() * 25;
      const baseRecovery = isWeekend ? 80 : 40 + Math.random() * 30;

      mockWorkload.push({
        date: date.toLocaleDateString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
        }),
        workload: Math.round(baseWorkload + (6 - i) * 3), // 逐渐增加的工作量
        energy: Math.round(Math.max(30, baseEnergy - (6 - i) * 2)), // 逐渐减少的精力
        recovery: Math.round(Math.max(20, baseRecovery - (6 - i) * 3)), // 逐渐减少的恢复
      });
    }

    setWorkload(mockWorkload);
  }, []);

  // 刷新数据
  const refreshData = useCallback(() => {
    setIsLoading(true);
    generateMockData();
  }, [generateMockData]);

  // 初始化数据
  useEffect(() => {
    generateMockData();
  }, [generateMockData]);

  // 更新压力等级和推荐
  useEffect(() => {
    if (workload.length > 0) {
      const level = detectStressLevel();
      setStressLevel(level);
      setRecommendations(generateRecommendations());
      setIsLoading(false);
    }
  }, [workload, detectStressLevel, generateRecommendations]);

  return {
    stressLevel,
    workload,
    recommendations,
    isLoading,
    refreshData,
  };
}
