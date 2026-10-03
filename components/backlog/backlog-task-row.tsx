// components/backlog/backlog-task-row.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TaskWithAssignee, TaskPriority } from "@/types";
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface Sprint {
  id: string;
  name: string;
  status: string;
}

interface BacklogTaskRowProps {
  task: TaskWithAssignee & { milestone: { id: string; name: string; phase: { name: string } } | null };
  sprints: Sprint[];
}

export function BacklogTaskRow({ task, sprints }: BacklogTaskRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [assigning, setAssigning] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState("");

  const activeSprints = sprints.filter((s) => s.status === "ACTIVE" || s.status === "PLANNED");

  async function assignToSprint() {
    if (!selectedSprint) return;
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintId: selectedSprint }),
    });
    setAssigning(false);
    startTransition(() => router.refresh());
  }

  async function removeFromSprint() {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintId: null }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className={cn(
      "flex items-start gap-3 border-b last:border-b-0 px-4 py-3 hover:bg-muted/30 transition-colors",
      isPending && "opacity-50"
    )}>
      {/* Priority dot */}
      <div className="mt-1 shrink-0">
        <span className={cn(
          "inline-flex items-center gap-1 text-xs font-medium",
          PRIORITY_COLORS[task.priority as TaskPriority]
        )}>
          <span className="h-2 w-2 rounded-full bg-current" />
        </span>
      </div>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.milestone && (
            <span className="truncate">
              {task.milestone.phase.name} → {task.milestone.name}
            </span>
          )}
          {task.dueDate && (
            <span>Due {format(new Date(task.dueDate), "MMM d")}</span>
          )}
        </div>
      </div>

      {/* Status */}
      <span className={cn(
        "hidden sm:inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]
      )}>
        {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
      </span>

      {/* Priority label */}
      <span className={cn(
        "hidden md:block shrink-0 text-xs font-medium",
        PRIORITY_COLORS[task.priority as TaskPriority]
      )}>
        {PRIORITY_LABELS[task.priority as TaskPriority]}
      </span>

      {/* Sprint assignment */}
      <div className="shrink-0">
        {task.sprint ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
              {task.sprint.name}
            </span>
            <button
              onClick={removeFromSprint}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              title="Remove from sprint"
            >
              ✕
            </button>
          </div>
        ) : assigning ? (
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              autoFocus
              className="rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select sprint…</option>
              {activeSprints.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={assignToSprint}
              disabled={!selectedSprint}
              className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setAssigning(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAssigning(true)}
            disabled={activeSprints.length === 0}
            title={activeSprints.length === 0 ? "No active or planned sprints" : "Assign to sprint"}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3 w-3" />
            Sprint
          </button>
        )}
      </div>
    </div>
  );
}
