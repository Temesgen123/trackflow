// components/projects/edit-project-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Trash2, AlertTriangle } from 'lucide-react';

type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
}
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [, startTransition] = useTransition();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState(
    project.startDate
      ? new Date(project.startDate).toISOString().split('T')[0]
      : '',
  );
  const [endDate, setEndDate] = useState(
    project.endDate
      ? new Date(project.endDate).toISOString().split('T')[0]
      : '',
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? 'Failed to save');
        toastError('Save failed', json.error);
        return;
      }
      success('Project updated!', 'Your changes have been saved.');
      startTransition(() => {
        router.refresh();
        setTimeout(() => router.push(`/projects/${project.id}`), 600);
      });
    } catch {
      toastError('Something went wrong', 'Please try again.');
      setError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteInput !== project.name) {
      setError("Project name doesn't match.");
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toastError('Delete failed', 'Could not delete project.');
        setDeleting(false);
        return;
      }
      success(
        'Project deleted',
        `"${project.name}" has been permanently deleted.`,
      );
      startTransition(() => router.push('/projects'));
    } catch {
      toastError('Something went wrong', 'Please try again.');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="space-y-5">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="proj-name">
            Project name <span className="text-destructive">*</span>
          </label>
          <input
            id="proj-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="proj-desc">
            Description
          </label>
          <textarea
            id="proj-desc"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="proj-status">
            Status
          </label>
          <select
            id="proj-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="proj-start">
              Start date
            </label>
            <input
              id="proj-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="proj-end">
              End date
            </label>
            <input
              id="proj-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/projects/${project.id}`)}
            className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <h3 className="text-sm font-semibold text-destructive">
            Danger zone
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Deleting is <strong>permanent</strong>. All phases, milestones, tasks
          and sprints will be removed.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete project
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Type{' '}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                {project.name}
              </span>{' '}
              to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              autoFocus
              placeholder={project.name}
              className="w-full rounded-md border border-destructive/40 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-destructive/30"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting || deleteInput !== project.name}
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteInput('');
                  setError(null);
                }}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
