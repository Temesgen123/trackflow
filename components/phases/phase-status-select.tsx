// components/phases/phase-status-select.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PhaseStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

const STATUSES: PhaseStatus[] = ["TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED"];

const COLOR: Record<PhaseStatus, string> = {
  TODO:        "bg-gray-100 text-gray-700 border-gray-300",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW:   "bg-orange-50 text-orange-700 border-orange-200",
  DONE:        "bg-green-50 text-green-700 border-green-200",
  BLOCKED:     "bg-red-50 text-red-700 border-red-200",
};

export function PhaseStatusSelect({ phaseId, current }: { phaseId: string; current: PhaseStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as PhaseStatus;
    await fetch(`/api/phases/${phaseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-pointer outline-none transition-opacity ${COLOR[current]} ${isPending ? "opacity-50" : ""}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
