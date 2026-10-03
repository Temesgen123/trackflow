// components/settings/profile-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name: initialName, email: initialEmail }: ProfileFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [, startTransition] = useTransition();
  const [name,    setName]    = useState(initialName);
  const [email,   setEmail]   = useState(initialEmail);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isDirty = name !== initialName || email !== initialEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty) return;
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch("/api/user", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to update profile");
        toastError("Update failed", json.error);
        return;
      }
      success("Profile updated!", "Your name and email have been saved.");
      startTransition(() => router.refresh());
    } catch {
      toastError("Something went wrong", "Please try again.");
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="profile-name">
          Full name <span className="text-destructive">*</span>
        </label>
        <input
          id="profile-name" type="text" required maxLength={100}
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="profile-email">
          Email address <span className="text-destructive">*</span>
        </label>
        <input
          id="profile-email" type="email" required maxLength={200}
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
        <p className="text-xs text-muted-foreground">
          Changing your email will require you to sign in again.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {!isDirty && (
          <p className="text-xs text-muted-foreground">No changes to save</p>
        )}
      </div>
    </form>
  );
}
