// components/tasks/task-detail-panel.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { TaskStatus, TaskPriority } from "@/types";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Check, X, Calendar, User, Flag, Layers, Timer, AlertCircle } from "lucide-react";

const STATUSES:   TaskStatus[]   = ["TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED"];
const PRIORITIES: TaskPriority[] = ["LOW","MEDIUM","HIGH","URGENT"];
const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW:"bg-green-500", MEDIUM:"bg-amber-400", HIGH:"bg-red-500", URGENT:"bg-purple-600",
};

interface UserRow   { id: string; name: string; email: string }
interface SprintRow { id: string; name: string; status: string }
interface Task {
  id: string; title: string; description: string | null;
  status: string; priority: string;
  dueDate: string | null; createdAt: string; updatedAt: string;
  assignee: { id: string; name: string; email: string } | null;
  sprint:   { id: string; name: string; status: string } | null;
  milestone: { id: string; name: string; phase: { id: string; name: string; project: { id: string; name: string } } } | null;
}

export function TaskDetailPanel({ task, users, sprints }: { task: Task; users: UserRow[]; sprints: SprintRow[] }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing,  setEditing]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title,       setTitle]       = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status,      setStatus]      = useState<TaskStatus>(task.status as TaskStatus);
  const [priority,    setPriority]    = useState<TaskPriority>(task.priority as TaskPriority);
  const [dueDate,     setDueDate]     = useState(task.dueDate ? task.dueDate.split("T")[0] : "");
  const [assigneeId,  setAssigneeId]  = useState(task.assignee?.id ?? "");
  const [sprintId,    setSprintId]    = useState(task.sprint?.id ?? "");
  const [error,       setError]       = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);

  async function handleSave() {
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError(null);
    try {
      const res  = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, status, priority,
          dueDate: dueDate || null, assigneeId: assigneeId || null, sprintId: sprintId || null }) });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error ?? "Failed to save"); toastError("Save failed"); return; }
      success("Task updated!");
      setEditing(false);
      startTransition(() => router.refresh());
    } catch { toastError("Something went wrong"); setError("Something went wrong."); }
    finally { setSaving(false); }
  }

  function handleCancel() {
    setTitle(task.title); setDescription(task.description ?? ""); setStatus(task.status as TaskStatus);
    setPriority(task.priority as TaskPriority); setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setAssigneeId(task.assignee?.id ?? ""); setSprintId(task.sprint?.id ?? "");
    setError(null); setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this task permanently?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      success("Task deleted");
      startTransition(() => router.push("/backlog"));
    } catch { toastError("Failed to delete task"); setDeleting(false); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Title + actions */}
        <div className="flex items-start gap-3 p-6 border-b">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold bg-transparent border-b-2 border-primary outline-none pb-1" autoFocus/>
            ) : (
              <h1 className={cn("text-xl font-bold leading-snug", status === "DONE" && "line-through text-muted-foreground")}>
                {task.title}
              </h1>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Created {format(new Date(task.createdAt), "MMM d, yyyy")} · Updated {format(new Date(task.updatedAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Check className="h-3.5 w-3.5"/>{saving ? "Saving…" : "Save"}
                </button>
                <button onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                  <X className="h-3.5 w-3.5"/>Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                  <Pencil className="h-3.5 w-3.5"/>Edit
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors">
                  <Trash2 className="h-3.5 w-3.5"/>{deleting ? "Deleting…" : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0"/>{error}
          </div>
        )}

        {/* Description */}
        <div className="p-6 border-b">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
          {editing ? (
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              placeholder="Add a description…"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"/>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {task.description || <span className="italic">No description</span>}
            </p>
          )}
        </div>

        {/* Properties grid */}
        <div className="grid grid-cols-2 gap-px bg-border">
          {/* Status */}
          <div className="bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5"/>Status
            </p>
            {editing ? (
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring w-full">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            ) : (
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[status as TaskStatus])}>
                <span className="h-1.5 w-1.5 rounded-full bg-current"/>{STATUS_LABELS[status as TaskStatus]}
              </span>
            )}
          </div>
          {/* Priority */}
          <div className="bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5"/>Priority
            </p>
            {editing ? (
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring w-full">
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            ) : (
              <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", PRIORITY_COLORS[priority as TaskPriority])}>
                <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[priority as TaskPriority])}/>
                {PRIORITY_LABELS[priority as TaskPriority]}
              </span>
            )}
          </div>
          {/* Due date */}
          <div className="bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5"/>Due date
            </p>
            {editing ? (
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring w-full"/>
            ) : (
              <p className="text-sm">{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : <span className="text-muted-foreground italic">None</span>}</p>
            )}
          </div>
          {/* Assignee */}
          <div className="bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5"/>Assignee
            </p>
            {editing ? (
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring w-full">
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            ) : task.assignee ? (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{task.assignee.name}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground italic">Unassigned</p>}
          </div>
          {/* Sprint */}
          <div className="bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5"/>Sprint
            </p>
            {editing ? (
              <select value={sprintId} onChange={(e) => setSprintId(e.target.value)}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring w-full">
                <option value="">No sprint</option>
                {sprints.map((s) => <option key={s.id} value={s.id}>{s.name}{s.status === "ACTIVE" ? " (Active)" : ""}</option>)}
              </select>
            ) : task.sprint ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {task.sprint.status === "ACTIVE" && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"/>}
                {task.sprint.name}
              </span>
            ) : <p className="text-sm text-muted-foreground italic">No sprint</p>}
          </div>
          {/* Milestone */}
          <div className="bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5"/>Milestone
            </p>
            {task.milestone ? (
              <p className="text-sm">{task.milestone.name}<span className="text-muted-foreground text-xs ml-1">· {task.milestone.phase.name}</span></p>
            ) : <p className="text-sm text-muted-foreground italic">None</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
