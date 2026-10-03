// components/tasks/task-list.tsx
"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TaskWithAssignee, TaskStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/types";
import { TaskForm } from "./task-form";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO:        "bg-gray-100 text-gray-700 border-gray-300",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW:   "bg-orange-50 text-orange-700 border-orange-200",
  DONE:        "bg-green-50 text-green-700 border-green-200",
  BLOCKED:     "bg-red-50 text-red-700 border-red-200",
};

const STATUSES: TaskStatus[] = ["TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED"];

interface TaskListProps {
  tasks: TaskWithAssignee[];
  milestoneId: string;
}

export function TaskList({ tasks, milestoneId }: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const { success } = useToast();
  const [, startTransition] = useTransition();

  async function updateStatus(taskId: string, status: TaskStatus) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    success("Task deleted");
    startTransition(() => router.refresh());
  }

  return (
    <div className="p-3 space-y-1.5">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm transition-opacity group",
            task.status === "DONE" && "opacity-60"
          )}
        >
          {/* Done toggle */}
          <button
            onClick={() => updateStatus(task.id, task.status === "DONE" ? "TODO" : "DONE")}
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors",
              task.status === "DONE"
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary"
            )}
            title={task.status === "DONE" ? "Mark as todo" : "Mark as done"}
          >
            {task.status === "DONE" && (
              <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/tasks/${task.id}`}
                className={cn(
                  "font-medium hover:text-primary hover:underline transition-colors truncate",
                  task.status === "DONE" && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </Link>
              <Link
                href={`/tasks/${task.id}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0"
                title="Open detail"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium cursor-pointer outline-none",
                  STATUS_COLOR[task.status]
                )}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>

              <span className={cn("text-xs font-medium flex items-center gap-1", PRIORITY_COLORS[task.priority])}>
                <span className="h-1.5 w-1.5 rounded-full bg-current inline-block"/>
                {PRIORITY_LABELS[task.priority]}
              </span>

              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  Due {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}

              {task.assignee && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                    {task.assignee.name?.charAt(0)}
                  </span>
                  {task.assignee.name}
                </span>
              )}
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => deleteTask(task.id)}
            className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0 opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}

      {showForm ? (
        <div className="rounded-lg border bg-card p-3 mt-1">
          <TaskForm
            milestoneId={milestoneId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      )}
    </div>
  );
}
