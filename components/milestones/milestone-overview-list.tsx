// components/milestones/milestone-overview-list.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, isPast, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Flag, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { calcMilestoneProgress } from "@/lib/utils/progress";

type MilestoneStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED";

const STATUS_STYLES: Record<MilestoneStatus, string> = {
  TODO:        "bg-gray-100 text-gray-700 border-gray-300",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW:   "bg-orange-50 text-orange-700 border-orange-200",
  DONE:        "bg-green-50 text-green-700 border-green-200",
  BLOCKED:     "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  TODO: "To do", IN_PROGRESS: "In progress",
  IN_REVIEW: "In review", DONE: "Done", BLOCKED: "Blocked",
};

interface Task { id: string; status: string; }
interface Milestone {
  id: string; name: string; description: string | null;
  status: MilestoneStatus; dueDate: string | null;
  tasks: Task[];
  phase: {
    id: string; name: string;
    project: { id: string; name: string; status: string };
  };
}

interface Props {
  milestones: Milestone[];
  now: string;
}

export function MilestoneOverviewList({ milestones, now }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const nowDate = new Date(now);

  async function updateStatus(id: string, status: MilestoneStatus) {
    await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  if (milestones.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-14 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Flag className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium">No milestones found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or add milestones inside a project phase.
        </p>
      </div>
    );
  }

  // Group by project
  const grouped = milestones.reduce<Record<string, { project: Milestone["phase"]["project"]; items: Milestone[] }>>(
    (acc, m) => {
      const pid = m.phase.project.id;
      if (!acc[pid]) acc[pid] = { project: m.phase.project, items: [] };
      acc[pid].items.push(m);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.values(grouped).map(({ project, items }) => (
        <div key={project.id}>
          {/* Project header */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href={`/projects/${project.id}`}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {project.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              · {items.length} milestone{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {items.map((ms, idx) => {
              const progress  = calcMilestoneProgress(ms.tasks);
              const isOverdue = ms.dueDate && ms.status !== "DONE" && isPast(new Date(ms.dueDate));
              const daysLeft  = ms.dueDate
                ? differenceInDays(new Date(ms.dueDate), nowDate)
                : null;

              return (
                <div
                  key={ms.id}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30",
                    idx !== items.length - 1 && "border-b"
                  )}
                >
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">
                    {ms.status === "DONE" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : ms.status === "BLOCKED" ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Flag className={cn(
                        "h-4 w-4",
                        isOverdue ? "text-red-400" : "text-primary"
                      )} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={cn(
                        "text-sm font-medium",
                        ms.status === "DONE" && "line-through text-muted-foreground"
                      )}>
                        {ms.name}
                      </p>
                      {/* Status select */}
                      <select
                        value={ms.status}
                        onChange={(e) => updateStatus(ms.id, e.target.value as MilestoneStatus)}
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-medium cursor-pointer outline-none",
                          STATUS_STYLES[ms.status]
                        )}
                      >
                        {(Object.keys(STATUS_LABELS) as MilestoneStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phase label */}
                    <p className="text-xs text-muted-foreground mb-2">
                      {ms.phase.name}
                    </p>

                    {/* Progress bar */}
                    {ms.tasks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-xs h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              progress === 100 ? "bg-green-500" : "bg-primary"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {ms.tasks.filter((t) => t.status === "DONE").length}/{ms.tasks.length} tasks
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Due date */}
                  {ms.dueDate && (
                    <div className={cn(
                      "shrink-0 flex items-center gap-1 text-xs font-medium",
                      isOverdue
                        ? "text-red-500"
                        : daysLeft !== null && daysLeft <= 7
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    )}>
                      <Clock className="h-3 w-3" />
                      {isOverdue
                        ? `${Math.abs(daysLeft!)}d overdue`
                        : daysLeft === 0
                        ? "Due today"
                        : daysLeft !== null && daysLeft > 0
                        ? `${daysLeft}d left`
                        : format(new Date(ms.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
