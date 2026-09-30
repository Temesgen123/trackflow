// components/sprints/sprint-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface SprintFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SprintForm({
  projectId,
  onSuccess,
  onCancel,
}: SprintFormProps) {
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
      projectId,
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      goal:
        (form.elements.namedItem('goal') as HTMLInputElement).value.trim() ||
        undefined,
      startDate: (form.elements.namedItem('startDate') as HTMLInputElement)
        .value,
      endDate: (form.elements.namedItem('endDate') as HTMLInputElement).value,
    };

    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? 'Failed to create sprint');
        return;
      }
      startTransition(() => router.refresh());
      onSuccess?.();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // Default: sprint starts today, ends in 14 days
  const today = new Date().toISOString().split('T')[0];
  const twoWeeks = new Date(Date.now() + 14 * 86400000)
    .toISOString()
    .split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="sprint-name">
          Sprint name <span className="text-destructive">*</span>
        </label>
        <input
          id="sprint-name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Sprint 1"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="sprint-goal">
          Sprint goal
        </label>
        <input
          id="sprint-goal"
          name="goal"
          type="text"
          maxLength={500}
          placeholder="e.g. Complete auth + core API routes"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="sprint-start">
            Start date <span className="text-destructive">*</span>
          </label>
          <input
            id="sprint-start"
            name="startDate"
            type="date"
            required
            defaultValue={today}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="sprint-end">
            End date <span className="text-destructive">*</span>
          </label>
          <input
            id="sprint-end"
            name="endDate"
            type="date"
            required
            defaultValue={twoWeeks}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating…' : 'Create sprint'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
