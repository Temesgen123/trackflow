// components/sprints/sprint-card.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Sprint, SprintStatus } from '@/types';
import { format } from 'date-fns';
import { Play, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<SprintStatus, string> = {
  PLANNED: 'bg-gray-100 text-gray-700 border-gray-300',
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
};

const STATUS_LABELS: Record<SprintStatus, string> = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
};

interface SprintCardProps {
  sprint: Sprint & { _count: { tasks: number } };
  hasActiveSprint: boolean;
}

export function SprintCard({ sprint, hasActiveSprint }: SprintCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function updateStatus(status: SprintStatus) {
    await fetch(`/api/sprints/${sprint.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  async function deleteSprint() {
    if (
      !confirm(
        `Delete "${sprint.name}"? Tasks will remain but be unassigned from this sprint.`,
      )
    )
      return;
    await fetch(`/api/sprints/${sprint.id}`, { method: 'DELETE' });
    startTransition(() => router.refresh());
  }

  const canStart = sprint.status === 'PLANNED' && !hasActiveSprint;
  const canComplete = sprint.status === 'ACTIVE';
  const isActive = sprint.status === 'ACTIVE';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        isActive && 'border-primary/40 ring-1 ring-primary/20',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-semibold">{sprint.name}</h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                STATUS_STYLES[sprint.status],
              )}
            >
              {isActive && (
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              )}
              {STATUS_LABELS[sprint.status]}
            </span>
          </div>
          {sprint.goal && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {sprint.goal}
            </p>
          )}
        </div>
        <button
          onClick={deleteSprint}
          disabled={isPending || isActive}
          title={isActive ? 'Cannot delete an active sprint' : 'Delete sprint'}
          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Dates + task count */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(sprint.startDate), 'MMM d')} →{' '}
          {format(new Date(sprint.endDate), 'MMM d, yyyy')}
        </span>
        <span>
          {sprint._count.tasks} task{sprint._count.tasks !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canStart && (
          <button
            onClick={() => updateStatus('ACTIVE')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            Start sprint
          </button>
        )}
        {hasActiveSprint && sprint.status === 'PLANNED' && (
          <p className="text-xs text-muted-foreground self-center">
            Complete the active sprint first
          </p>
        )}
        {canComplete && (
          <button
            onClick={() => updateStatus('COMPLETED')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete sprint
          </button>
        )}
        {isActive && (
          <a
            href="/board"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            View board →
          </a>
        )}
      </div>
    </div>
  );
}
