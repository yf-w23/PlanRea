"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 获取当前页面标题
  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/planner": "Planner",
      "/calendar": "Calendar",
      "/tasks": "Tasks",
      "/focus": "Focus",
      "/recovery": "Recovery",
      "/settings": "Settings",
    };
    return pathMap[pathname] || "PlanRea";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 桌面端侧边栏 */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card lg:block">
        <Sidebar currentPath={pathname} />
      </aside>

      {/* 移动端顶部头部 */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-accent">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar 
                currentPath={pathname} 
                onNavigate={() => setMobileMenuOpen(false)} 
              />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold">{getPageTitle()}</span>
        </div>
      </header>

      {/* 桌面端头部 */}
      <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 border-b bg-background px-6 lg:block">
        <Header title={getPageTitle()} />
      </header>

      {/* 主内容区 */}
      <main className="pt-14 lg:pl-64 lg:pt-16">
        <div className="min-h-[calc(100vh-7rem)] p-4 lg:min-h-[calc(100vh-4rem)] lg:p-6">
          {children}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <BottomNav currentPath={pathname} />
    </div>
  );
}
