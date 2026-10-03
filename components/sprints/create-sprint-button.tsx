// components/sprints/create-sprint-button.tsx
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SprintForm } from "./sprint-form";

export function CreateSprintButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold">New sprint</h2>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <SprintForm
            projectId={projectId}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Plus className="h-4 w-4" />
      New sprint
    </button>
  );
}
