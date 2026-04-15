"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Target,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  currentPath: string;
}

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Add", href: "/planner", icon: Plus, isAction: true },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Focus", href: "/focus", icon: Target },
];

export function BottomNav({ currentPath }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
          const Icon = item.icon;

          // 中间的大按钮
          if (item.isAction) {
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  <Icon className="h-6 w-6" />
                </Button>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1 transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* 安全区域适配（iOS） */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
