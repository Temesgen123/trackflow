// components/ui/status-badge.tsx
// Reusable status badge used on Phase, Milestone, and Task

"use client";

import { cn } from "@/lib/utils";
import type { TaskStatus, PhaseStatus, MilestoneStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

type Status = TaskStatus | PhaseStatus | MilestoneStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const DOT_COLORS: Record<Status, string> = {
  TODO: "bg-gray-500",
  IN_PROGRESS: "bg-blue-600",
  IN_REVIEW: "bg-orange-500",
  DONE: "bg-green-600",
  BLOCKED: "bg-red-600",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
