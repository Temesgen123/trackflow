// components/tasks/task-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface TaskFormProps {
  milestoneId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ milestoneId, onSuccess, onCancel }: TaskFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      title:    (form.elements.namedItem("title")    as HTMLInputElement).value,
      priority: (form.elements.namedItem("priority") as HTMLSelectElement).value,
      dueDate:  (form.elements.namedItem("dueDate")  as HTMLInputElement).value || undefined,
    };

    try {
      const res = await fetch(`/api/milestones/${milestoneId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error ?? "Failed"); return; }
      startTransition(() => router.refresh());
      onSuccess?.();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
      <div className="flex-1 min-w-40 space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="task-title">Task *</label>
        <input
          id="task-title" name="title" type="text" required maxLength={200}
          placeholder="e.g. Set up database connection"
          autoFocus
          className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="task-priority">Priority</label>
        <select id="task-priority" name="priority" defaultValue="MEDIUM"
          className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="task-due">Due</label>
        <input id="task-due" name="dueDate" type="date"
          className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"/>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "…" : "Add"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
