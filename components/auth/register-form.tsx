// components/auth/register-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

function StrengthBar({ password }: { password: string }) {
  function score(p: string) {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)  s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }
  const s = score(password);
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-blue-500", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const textColors = ["", "text-red-500", "text-orange-500", "text-amber-500", "text-blue-600", "text-green-600"];

  if (!password) return null;
  return (
    <div className="space-y-1 mt-1.5">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= s ? colors[s] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[s]}`}>{labels[s]}</p>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  // Real-time validation hints
  const passwordOk  = password.length >= 8;
  const confirmOk   = confirm === password && confirm.length > 0;
  const formValid   = name.trim() && email && passwordOk && confirmOk;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    setError(null);

    try {
      // 1. Create account
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? "Registration failed. Please try again.");
        return;
      }

      // 2. Auto sign-in after registration
      setSuccess(true);
      const result = await signIn("credentials", {
        email:    email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Account created but sign-in failed — redirect to login
        startTransition(() => router.push("/login?registered=1"));
      } else {
        startTransition(() => router.push("/dashboard"));
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success && !error) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-semibold text-foreground">Account created!</p>
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-name">
          Full name <span className="text-destructive">*</span>
        </label>
        <input
          id="reg-name" type="text" required maxLength={100}
          autoComplete="name" placeholder="Jane Smith"
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-email">
          Email address <span className="text-destructive">*</span>
        </label>
        <input
          id="reg-email" type="email" required
          autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-password">
          Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPass ? "text" : "password"}
            required autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <button
            type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <StrengthBar password={password} />
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-confirm">
          Confirm password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-confirm" type="password" required
            autoComplete="new-password" placeholder="••••••••"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className={`w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow ${
              confirm && !confirmOk ? "border-destructive focus:ring-destructive/30" : ""
            } ${confirmOk ? "border-green-400" : ""}`}
          />
          {confirmOk && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
          )}
        </div>
        {confirm && !confirmOk && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1 text-xs text-muted-foreground">
        {[
          { ok: name.trim().length > 0,  label: "Name provided"              },
          { ok: /\S+@\S+\.\S+/.test(email), label: "Valid email address"     },
          { ok: passwordOk,               label: "Password at least 8 chars" },
          { ok: confirmOk,                label: "Passwords match"            },
        ].map(({ ok: met, label }) => (
          <li key={label} className={`flex items-center gap-1.5 transition-colors ${met ? "text-green-600" : ""}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${met ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            {label}
          </li>
        ))}
      </ul>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !formValid}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
