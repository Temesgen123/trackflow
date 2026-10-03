// components/reminders/reminder-panel.tsx
"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Pencil, Check, X, Bell } from "lucide-react";

interface Reminder {
  id:        string;
  text:      string;
  status:    "PENDING" | "DONE";
  createdAt: string;
  updatedAt: string;
}

type OptimisticAction =
  | { type: "add";    reminder: Reminder }
  | { type: "update"; id: string; changes: Partial<Reminder> }
  | { type: "delete"; id: string };

function applyAction(state: Reminder[], action: OptimisticAction): Reminder[] {
  switch (action.type) {
    case "add":    return [action.reminder, ...state];
    case "update": return state.map((r) => r.id === action.id ? { ...r, ...action.changes } : r);
    case "delete": return state.filter((r) => r.id !== action.id);
    default:       return state;
  }
}

export function ReminderPanel({ initialReminders }: { initialReminders: Reminder[] }) {
  const [reminders, addOptimistic] = useOptimistic(initialReminders, applyAction);
  const [, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  const [newText,    setNewText]    = useState("");
  const [adding,     setAdding]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState("");
  const [filter,     setFilter]     = useState<"ALL" | "PENDING" | "DONE">("ALL");

  const filtered = reminders.filter((r) =>
    filter === "ALL" ? true : r.status === filter
  );

  const pendingCount = reminders.filter((r) => r.status === "PENDING").length;
  const doneCount    = reminders.filter((r) => r.status === "DONE").length;

  // ── Create ──────────────────────────────────────────────────
  async function handleCreate() {
    if (!newText.trim()) return;
    setSaving(true);
    const optimisticReminder: Reminder = {
      id:        `temp-${Date.now()}`,
      text:      newText.trim(),
      status:    "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    startTransition(() => addOptimistic({ type: "add", reminder: optimisticReminder }));
    try {
      const res  = await fetch("/api/reminders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: newText.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { toastError("Failed to save reminder"); return; }
      success("Reminder added!");
      setNewText("");
      setAdding(false);
      // Refresh to replace temp id with real one
      startTransition(() => { window.location.reload(); });
    } catch {
      toastError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle done/pending ──────────────────────────────────────
  async function handleToggle(r: Reminder) {
    const newStatus = r.status === "DONE" ? "PENDING" : "DONE";
    startTransition(() => addOptimistic({ type: "update", id: r.id, changes: { status: newStatus } }));
    try {
      await fetch(`/api/reminders/${r.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
    } catch {
      toastError("Failed to update reminder");
    }
  }

  // ── Edit ────────────────────────────────────────────────────
  function startEdit(r: Reminder) {
    setEditingId(r.id);
    setEditText(r.text);
  }

  async function handleEdit(id: string) {
    if (!editText.trim()) return;
    startTransition(() => addOptimistic({ type: "update", id, changes: { text: editText.trim() } }));
    setEditingId(null);
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) toastError("Failed to update reminder");
      else success("Reminder updated!");
    } catch {
      toastError("Something went wrong.");
    }
  }

  // ── Delete ──────────────────────────────────────────────────
  async function handleDelete(id: string) {
    startTransition(() => addOptimistic({ type: "delete", id }));
    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      success("Reminder deleted");
    } catch {
      toastError("Failed to delete reminder");
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Reminders & Todos</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 leading-none">
              {pendingCount}
            </span>
          )}
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="px-5 py-3 border-b bg-muted/10">
          <div className="flex gap-2">
            <input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setAdding(false); setNewText(""); } }}
              placeholder="What do you need to remember?"
              maxLength={500}
              className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !newText.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "…" : "Save"}
            </button>
            <button
              onClick={() => { setAdding(false); setNewText(""); }}
              className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">Press Enter to save · Esc to cancel</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-0 border-b">
        {(["ALL", "PENDING", "DONE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors border-b-2",
              filter === f
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "ALL" ? `All (${reminders.length})` : f === "PENDING" ? `Pending (${pendingCount})` : `Done (${doneCount})`}
          </button>
        ))}
      </div>

      {/* Reminder list */}
      <div className="divide-y max-h-72 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              {filter === "DONE" ? "No completed reminders yet" : "No reminders yet — add one above!"}
            </p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className={cn(
                "flex items-start gap-3 px-5 py-3 group transition-colors hover:bg-muted/20",
                r.status === "DONE" && "opacity-60"
              )}
            >
              {/* Checkbox toggle */}
              <button
                onClick={() => handleToggle(r)}
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors",
                  r.status === "DONE"
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-muted-foreground/30 hover:border-primary"
                )}
                title={r.status === "DONE" ? "Mark as pending" : "Mark as done"}
              >
                {r.status === "DONE" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </button>

              {/* Text / edit inline */}
              <div className="flex-1 min-w-0">
                {editingId === r.id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleEdit(r.id); if (e.key === "Escape") setEditingId(null); }}
                      maxLength={500}
                      className="flex-1 rounded-md border bg-background px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button onClick={() => handleEdit(r.id)} className="text-primary hover:text-primary/80 transition-colors">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={cn(
                      "text-sm leading-snug",
                      r.status === "DONE" && "line-through text-muted-foreground"
                    )}>
                      {r.text}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(r.createdAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </>
                )}
              </div>

              {/* Actions — visible on hover */}
              {editingId !== r.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(r)}
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer summary */}
      {reminders.length > 0 && (
        <div className="px-5 py-2.5 border-t bg-muted/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {pendingCount} pending · {doneCount} done
          </p>
          {doneCount > 0 && (
            <button
              onClick={async () => {
                const done = reminders.filter((r) => r.status === "DONE");
                for (const r of done) {
                  startTransition(() => addOptimistic({ type: "delete", id: r.id }));
                  await fetch(`/api/reminders/${r.id}`, { method: "DELETE" });
                }
                success(`Cleared ${done.length} completed reminder${done.length > 1 ? "s" : ""}`);
              }}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
