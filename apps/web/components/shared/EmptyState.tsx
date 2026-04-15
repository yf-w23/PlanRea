"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon, Inbox, Search, Calendar, CheckCircle, FolderOpen } from "lucide-react";

type EmptyIcon = "inbox" | "search" | "calendar" | "tasks" | "folder" | "custom";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: EmptyIcon;
  customIcon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap: Record<EmptyIcon, LucideIcon> = {
  inbox: Inbox,
  search: Search,
  calendar: Calendar,
  tasks: CheckCircle,
  folder: FolderOpen,
  custom: Inbox,
};

export function EmptyState({
  title = "No items found",
  description = "There are no items to display at the moment.",
  icon = "inbox",
  customIcon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = customIcon || iconMap[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// 预定义的常用空状态
export function EmptyTasks({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="tasks"
      title="No tasks yet"
      description="Get started by creating your first task to track your progress."
      action={onCreate ? { label: "Create Task", onClick: onCreate } : undefined}
    />
  );
}

export function EmptySearch({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description="We couldn't find any items matching your search criteria."
      action={onClear ? { label: "Clear Search", onClick: onClear } : undefined}
    />
  );
}

export function EmptyCalendar({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="calendar"
      title="No events scheduled"
      description="Your calendar is clear. Add events to plan your day."
      action={onAdd ? { label: "Add Event", onClick: onAdd } : undefined}
    />
  );
}

export function EmptyFolder({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon="folder"
      title="Folder is empty"
      description="This folder doesn't have any items yet."
      action={onUpload ? { label: "Upload File", onClick: onUpload } : undefined}
    />
  );
}
