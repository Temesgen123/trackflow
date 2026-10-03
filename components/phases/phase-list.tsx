// components/phases/phase-list.tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { PhaseStatusSelect } from './phase-status-select';
import { PhaseForm } from './phase-form';
import { ProgressBar } from '@/components/ui/progress-bar';
import { MilestoneList } from '@/components/milestones/milestone-list';
import type { PhaseWithMilestones } from '@/types';
import { calcMilestoneProgress } from '@/lib/utils/progress';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

interface PhaseListProps {
  phases: PhaseWithMilestones[];
  projectId: string;
}

export function PhaseList({ phases, projectId }: PhaseListProps) {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(phases.map((p) => [p.id, true])),
  );
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function deletePhase(id: string) {
    if (!confirm('Delete this phase and all its milestones and tasks?')) return;
    await fetch(`/api/phases/${id}`, { method: 'DELETE' });
    success('Phase deleted');
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      {phases.map((phase) => {
        const allTasks = phase.milestones.flatMap((m) => m.tasks);
        const progress = calcMilestoneProgress(allTasks);
        const isOpen = expanded[phase.id] ?? true;

        return (
          <div
            key={phase.id}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            {/* Phase header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
              <button
                onClick={() => toggle(phase.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-sm">{phase.name}</span>
                  <PhaseStatusSelect
                    phaseId={phase.id}
                    current={phase.status}
                  />
                  {phase.description && (
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">
                      {phase.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {progress}%
                </span>
                <button
                  onClick={() => deletePhase(phase.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete phase"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 pt-3">
              <ProgressBar value={progress} showPercent={false} />
            </div>

            {/* Milestones */}
            <div className={cn('transition-all', isOpen ? 'block' : 'hidden')}>
              <MilestoneList milestones={phase.milestones} phaseId={phase.id} />
            </div>
          </div>
        );
      })}

      {/* Add phase form */}
      {showForm ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">New phase</h3>
          <PhaseForm
            projectId={projectId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          <Plus className="h-4 w-4" /> Add phase
        </button>
      )}
    </div>
  );
}
