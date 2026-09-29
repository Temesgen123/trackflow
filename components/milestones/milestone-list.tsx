// components/milestones/milestone-list.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MilestoneWithTasks } from "@/types";
import { MilestoneStatusSelect } from "./milestone-status-select";
import { MilestoneForm } from "./milestone-form";
import { TaskList } from "@/components/tasks/task-list";
import { ProgressBar } from "@/components/ui/progress-bar";
import { calcMilestoneProgress } from "@/lib/utils/progress";
import { Plus, Trash2, ChevronDown, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MilestoneListProps {
  milestones: MilestoneWithTasks[];
  phaseId: string;
}

export function MilestoneList({ milestones, phaseId }: MilestoneListProps) {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(milestones.map((m) => [m.id, false]))
  );
  const router = useRouter();
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function deleteMilestone(id: string) {
    if (!confirm("Delete this milestone and its tasks?")) return;
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div className="p-4 space-y-2">
      {milestones.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground py-1 pl-1">No milestones yet.</p>
      )}

      {milestones.map((ms) => {
        const progress = calcMilestoneProgress(ms.tasks);
        const isOpen = expanded[ms.id] ?? false;

        return (
          <div key={ms.id} className="rounded-lg border bg-background">
            {/* Milestone row */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <button onClick={() => toggle(ms.id)} className="text-muted-foreground hover:text-foreground">
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              <Flag className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{ms.name}</span>
                  <MilestoneStatusSelect milestoneId={ms.id} current={ms.status} />
                  {ms.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(ms.dueDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                {ms.tasks.length > 0 && (
                  <div className="mt-1.5">
                    <ProgressBar value={progress} showPercent={false} className="max-w-xs" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{ms._count.tasks} tasks</span>
                <button
                  onClick={() => deleteMilestone(ms.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete milestone"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Tasks (collapsible) */}
            <div className={cn(isOpen ? "block" : "hidden", "border-t")}>
              <TaskList tasks={ms.tasks} milestoneId={ms.id} />
            </div>
          </div>
        );
      })}

      {/* Add milestone form */}
      {showForm ? (
        <div className="rounded-lg border bg-background p-4 mt-2">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">New milestone</p>
          <MilestoneForm
            phaseId={phaseId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 pl-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add milestone
        </button>
      )}
    </div>
  );
}
