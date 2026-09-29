// components/ui/priority-badge.tsx

"use client";

import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/types";

const DOT_BG: Record<TaskPriority, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-red-500",
  URGENT: "bg-purple-600",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        PRIORITY_COLORS[priority],
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", DOT_BG[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
