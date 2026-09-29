// components/phases/phase-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface PhaseFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PhaseForm({ projectId, onSuccess, onCancel }: PhaseFormProps) {
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
      name:        (form.elements.namedItem("name")      as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      startDate:   (form.elements.namedItem("startDate") as HTMLInputElement).value || undefined,
      endDate:     (form.elements.namedItem("endDate")   as HTMLInputElement).value || undefined,
    };

    try {
      const res = await fetch(`/api/projects/${projectId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error ?? "Failed"); return; }
      startTransition(() => { router.refresh(); });
      onSuccess?.();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="phase-name">
          Phase name <span className="text-destructive">*</span>
        </label>
        <input
          id="phase-name" name="name" type="text" required maxLength={100}
          placeholder="e.g. Requirements, Design, Development…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="phase-desc">Description</label>
        <input
          id="phase-desc" name="description" type="text" maxLength={500}
          placeholder="Optional description"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="phase-start">Start date</label>
          <input id="phase-start" name="startDate" type="date"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="phase-end">End date</label>
          <input id="phase-end" name="endDate" type="date"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/>
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "Adding…" : "Add phase"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
