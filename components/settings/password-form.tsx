// components/settings/password-form.tsx
"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff } from "lucide-react";

export function PasswordForm() {
  const { success, error: toastError } = useToast();
  const [current,    setCurrent]    = useState("");
  const [newPass,    setNewPass]    = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showCurr,   setShowCurr]   = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  function validate() {
    if (!current) return "Current password is required";
    if (newPass.length < 8) return "New password must be at least 8 characters";
    if (newPass !== confirm) return "Passwords do not match";
    if (newPass === current) return "New password must be different from current";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch("/api/user", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to change password");
        toastError("Password change failed", json.error);
        return;
      }
      success("Password changed!", "You can now sign in with your new password.");
      setCurrent(""); setNewPass(""); setConfirm("");
    } catch {
      toastError("Something went wrong", "Please try again.");
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function PasswordInput({
    id, label, value, onChange, show, onToggle, placeholder,
  }: {
    id: string; label: string; value: string;
    onChange: (v: string) => void; show: boolean;
    onToggle: () => void; placeholder?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor={id}>{label}</label>
        <div className="relative">
          <input
            id={id} type={show ? "text" : "password"} value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "••••••••"}
            className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <button
            type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }

  /* Strength indicator */
  function strength(p: string) {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)  s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  const str = strength(newPass);
  const strLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][str];
  const strColor = ["", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-blue-500", "bg-green-500"][str];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <PasswordInput
        id="curr-pass" label="Current password"
        value={current} onChange={setCurrent}
        show={showCurr} onToggle={() => setShowCurr((v) => !v)}
      />

      <PasswordInput
        id="new-pass" label="New password"
        value={newPass} onChange={setNewPass}
        show={showNew} onToggle={() => setShowNew((v) => !v)}
        placeholder="Min. 8 characters"
      />

      {/* Strength bar */}
      {newPass && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= str ? strColor : "bg-muted"}`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${str >= 4 ? "text-green-600" : str >= 3 ? "text-blue-600" : "text-muted-foreground"}`}>
            {strLabel}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="confirm-pass">Confirm new password</label>
        <input
          id="confirm-pass" type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow ${
            confirm && confirm !== newPass ? "border-destructive focus:ring-destructive/30" : ""
          }`}
        />
        {confirm && confirm !== newPass && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>

      <div className="pt-1">
        <button
          type="submit" disabled={saving}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Changing…" : "Change password"}
        </button>
      </div>
    </form>
  );
}
