'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  LayoutDashboard,
  Bell,
  Settings,
  User,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  TodaysFocus,
  ProgressCard,
  UpcomingTasks,
  EnergyLevelChart,
} from './components';
import {
  mockTasks,
  mockEnergyLevels,
  todaysFocusTask,
  getWeeklyStats,
  getCurrentEnergyLevel,
} from './lib/mock-data';
import { useClientDate, useGreeting } from './hooks/use-client-date';

// 数据获取函数
const fetchDashboardData = async () => {
  return {
    tasks: mockTasks,
    energyLevels: mockEnergyLevels,
    focusTask: todaysFocusTask,
    stats: getWeeklyStats(),
    currentEnergy: getCurrentEnergyLevel(),
  };
};

export default function DashboardPage() {
  // 使用 TanStack Query 获取数据
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  // 使用客户端日期（避免 hydration 错误）
  const greeting = useGreeting();
  const { date: clientDate, hour: currentHour, isMounted } = useClientDate();
  
  // 格式化日期（只在客户端挂载后）
  const currentDate = isMounted 
    ? format(clientDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })
    : '加载中...';

  // 事件处理
  const handleStartFocus = (taskId: string) => {
    console.log('开始专注任务:', taskId);
    // 导航到专注页面或打开专注模态框
  };

  const handleTaskClick = (taskId: string) => {
    console.log('查看任务详情:', taskId);
    // 导航到任务详情页
  };

  const handleViewAllTasks = () => {
    console.log('查看全部任务');
    // 导航到任务列表页
  };

  // 加载状态由 loading.tsx 处理
  if (isLoading || !data) {
    return null;
  }

  // 错误状态
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive">加载失败，请重试</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* 左侧 Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">PlanRea</span>
            </div>

            {/* 中间导航 */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                仪表盘
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                任务
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                计划
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                统计
              </Button>
            </nav>

            {/* 右侧操作 */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Avatar className="w-9 h-9 cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {/* 欢迎语 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{greeting}</h1>
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>

        {/* 仪表盘网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大卡片：今日专注 */}
          <div className="lg:col-span-2">
            <TodaysFocus
              task={data.focusTask}
              currentEnergyLevel={data.currentEnergy.level}
              onStart={handleStartFocus}
            />
          </div>

          {/* 右侧小卡片：本周进度 */}
          <div>
            <ProgressCard
              completedTasks={data.stats.completedTasks}
              totalTasks={data.stats.totalTasks}
              completionRate={data.stats.completionRate}
            />
          </div>

          {/* 下方左侧：能量曲线 */}
          <div className="lg:col-span-2">
            <EnergyLevelChart
              data={data.energyLevels}
              currentHour={currentHour}
            />
          </div>

          {/* 下方右侧：即将开始 */}
          <div>
            <UpcomingTasks
              tasks={data.tasks}
              onTaskClick={handleTaskClick}
              onViewAll={handleViewAllTasks}
            />
          </div>
        </div>

        {/* 底部快捷操作 */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">快速开始</h3>
              <p className="text-sm text-muted-foreground">
                基于你的能量水平，现在适合进行深度工作
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                添加任务
              </Button>
              <Button size="sm">开始专注</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
