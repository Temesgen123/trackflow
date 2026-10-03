// components/ui/toast.tsx — Lightweight toast system (no external dependency)
"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5
    const duration = opts.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) =>
    toast({ type: "success", title, description }), [toast]);
  const error   = useCallback((title: string, description?: string) =>
    toast({ type: "error",   title, description, duration: 6000 }), [toast]);
  const warning = useCallback((title: string, description?: string) =>
    toast({ type: "warning", title, description }), [toast]);
  const info    = useCallback((title: string, description?: string) =>
    toast({ type: "info",    title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────
function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-full max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

// ─── Individual toast ────────────────────────────────────────────────────────
const STYLES: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
  success: { bar: "bg-green-500",  icon: "text-green-600",  bg: "bg-white dark:bg-card", border: "border-green-200" },
  error:   { bar: "bg-red-500",    icon: "text-red-600",    bg: "bg-white dark:bg-card", border: "border-red-200"   },
  warning: { bar: "bg-amber-400",  icon: "text-amber-500",  bg: "bg-white dark:bg-card", border: "border-amber-200" },
  info:    { bar: "bg-blue-500",   icon: "text-blue-600",   bg: "bg-white dark:bg-card", border: "border-blue-200"  },
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error:   <XCircle      className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info:    <Info          className="h-4 w-4" />,
};

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const s = STYLES[toast.type];

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => dismiss(toast.id), 300);
  }

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 overflow-hidden transition-all duration-300",
        s.bg, s.border,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {/* Left colour bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", s.bar)} />

      {/* Icon */}
      <span className={cn("mt-0.5 shrink-0", s.icon)}>
        {ICONS[toast.type]}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0 pl-1">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
