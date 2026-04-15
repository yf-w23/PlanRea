"use client";

import { Search, Bell, Plus, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <div className="flex h-full items-center justify-between">
      {/* 页面标题 */}
      <h1 className="text-xl font-semibold">{title}</h1>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-2">
        {/* 搜索框 */}
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索任务..."
            className="pl-9"
          />
        </div>

        {/* 新建任务按钮 */}
        <Link href="/planner">
          <Button size="sm" className="hidden sm:flex">
            <Plus className="mr-1 h-4 w-4" />
            新建任务
          </Button>
        </Link>

        {/* 设置按钮 */}
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>

        {/* 通知下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>通知</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex flex-col items-start py-2 cursor-pointer">
                <p className="text-sm font-medium">任务即将截止</p>
                <p className="text-xs text-muted-foreground">
                  "完成项目提案" 将在2小时后截止
                </p>
                <p className="text-xs text-muted-foreground mt-1">2小时前</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2 cursor-pointer">
                <p className="text-sm font-medium">休息提醒</p>
                <p className="text-xs text-muted-foreground">
                  该休息一下，恢复精力了
                </p>
                <p className="text-xs text-muted-foreground mt-1">30分钟前</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2 cursor-pointer">
                <p className="text-sm font-medium">达成目标</p>
                <p className="text-xs text-muted-foreground">
                  你今天完成了5个任务！
                </p>
                <p className="text-xs text-muted-foreground mt-1">1小时前</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              查看全部通知
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 用户头像下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>用户名</span>
                <span className="text-xs text-muted-foreground font-normal">user@example.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
