'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyLevel } from '../lib/mock-data';

interface EnergyLevelChartProps {
  data: EnergyLevel[];
  currentHour?: number;
}

export function EnergyLevelChart({
  data,
  currentHour,
}: EnergyLevelChartProps) {
  const hour = currentHour ?? new Date().getHours();

  // 获取当前能量水平
  const currentEnergy = useMemo(() => {
    return data.find((d) => d.hour === hour) || data[0];
  }, [data, hour]);

  // 格式化时间标签
  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // 自定义 Tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: number;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const level = payload[0].value;
      let status = '低';
      let statusColor = 'text-blue-500';
      if (level >= 80) {
        status = '高';
        statusColor = 'text-emerald-500';
      } else if (level >= 50) {
        status = '中';
        statusColor = 'text-amber-500';
      }

      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">
            {label !== undefined ? formatTime(label) : ''}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">{level}</span>
            <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            精力{status === '高' ? '充沛' : status === '中' ? '一般' : '较低'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold">能量曲线</CardTitle>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">高</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">中</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">低</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 当前能量状态 */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">当前精力水平</p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  currentEnergy.level >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : currentEnergy.level >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {currentEnergy.level}
              </span>
              <span className="text-sm text-muted-foreground">
                ({currentEnergy.label})
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">最佳工作时段</p>
            <p className="text-sm font-medium">09:00 - 11:00</p>
          </div>
        </div>

        {/* 图表 */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="hour"
                tickFormatter={(value) => `${value}:00`}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* 高精力区域参考线 */}
              <ReferenceLine
                y={80}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={50}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />

              {/* 当前时间标记 */}
              <ReferenceDot
                x={hour}
                y={currentEnergy.level}
                r={6}
                fill="#8b5cf6"
                stroke="#ffffff"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="level"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#energyGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 时段建议 */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              09:00-11:00
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              深度工作
            </p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              14:00-16:00
            </p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              协作会议
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              20:00-22:00
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
              轻松学习
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
