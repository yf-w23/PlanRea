import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, Calendar, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PlanRea</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              登录
            </Link>
            <Link href="/register">
              <Button size="sm">免费开始</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            AI 驱动的智能项目管理
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            让 AI 帮你规划
            <br />
            <span className="text-primary">你只需专注执行</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            PlanRea 是一款 AI 项目管理应用，将目标自动分解为可执行计划，
            并根据你的状态智能安排到日常生活中。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                立即开始
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                使用演示账号
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            演示账号: admin@example.com / admin123
          </p>
        </div>
      </section>

      {/* 功能特点 */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-16">
            核心功能
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI 零努力规划"
              description="输入目标，AI 自动分解为可执行的任务清单和时间表"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="情境感知调度"
              description="根据你的日历、精力水平和习惯智能安排任务"
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="抗动力流失设计"
              description="Just Start 模式帮你克服拖延，保持高效执行"
            />
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            准备好提高效率了吗？
          </h2>
          <p className="text-muted-foreground mb-8">
            加入 PlanRea，让 AI 成为你的个人项目管家
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              免费注册
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 PlanRea. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-muted/50 border hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
