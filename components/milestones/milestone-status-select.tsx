// components/milestones/milestone-status-select.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MilestoneStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

const STATUSES: MilestoneStatus[] = ["TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED"];
const COLOR: Record<MilestoneStatus, string> = {
  TODO:        "bg-gray-100 text-gray-700 border-gray-300",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW:   "bg-orange-50 text-orange-700 border-orange-200",
  DONE:        "bg-green-50 text-green-700 border-green-200",
  BLOCKED:     "bg-red-50 text-red-700 border-red-200",
};

export function MilestoneStatusSelect({ milestoneId, current }: { milestoneId: string; current: MilestoneStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as MilestoneStatus;
    await fetch(`/api/milestones/${milestoneId}`, {
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
      className={`rounded-full border px-2 py-0.5 text-xs font-medium cursor-pointer outline-none ${COLOR[current]} ${isPending ? "opacity-50" : ""}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
