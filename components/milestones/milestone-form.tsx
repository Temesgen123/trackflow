// components/milestones/milestone-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface MilestoneFormProps {
  phaseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MilestoneForm({ phaseId, onSuccess, onCancel }: MilestoneFormProps) {
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
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value,
      dueDate: (form.elements.namedItem("dueDate") as HTMLInputElement).value || undefined,
    };

    try {
      const res = await fetch(`/api/phases/${phaseId}/milestones`, {
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
      <div className="flex-1 min-w-40 space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="ms-name">Name *</label>
        <input
          id="ms-name" name="name" type="text" required maxLength={100}
          placeholder="e.g. Backend API complete"
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="ms-due">Due date</label>
        <input
          id="ms-due" name="dueDate" type="date"
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "Adding…" : "Add"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
