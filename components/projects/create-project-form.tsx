// components/projects/create-project-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function CreateProjectForm() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name:        (form.elements.namedItem("name")        as HTMLInputElement).value.trim(),
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim() || undefined,
      startDate:   (form.elements.namedItem("startDate")   as HTMLInputElement).value || undefined,
      endDate:     (form.elements.namedItem("endDate")     as HTMLInputElement).value || undefined,
    };
    try {
      const res  = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok || json.error) {
        const msg = typeof json.error === "string" ? json.error : "Validation failed.";
        setError(msg);
        toastError("Failed to create project", msg);
        return;
      }
      success("Project created!", `"${data.name}" is ready.`);
      startTransition(() => { router.push(`/projects/${json.data.id}`); router.refresh(); });
    } catch {
      toastError("Something went wrong", "Please try again.");
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="name">Project name <span className="text-destructive">*</span></label>
        <input id="name" name="name" type="text" required maxLength={100} placeholder="e.g. TrackFlow App"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"/>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} maxLength={500} placeholder="What is this project about?"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="startDate">Start date</label>
          <input id="startDate" name="startDate" type="date"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="endDate">End date</label>
          <input id="endDate" name="endDate" type="date"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "Creating…" : "Create project"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-md border bg-background px-5 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
