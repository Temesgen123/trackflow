// components/milestones/milestone-overview-filters.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "",           label: "All statuses"  },
  { value: "TODO",       label: "To do"         },
  { value: "IN_PROGRESS",label: "In progress"   },
  { value: "IN_REVIEW",  label: "In review"     },
  { value: "DONE",       label: "Done"          },
  { value: "BLOCKED",    label: "Blocked"       },
];

const DUE_OPTIONS = [
  { value: "",           label: "Any due date"  },
  { value: "overdue",    label: "Overdue"       },
  { value: "this-week",  label: "Due this week" },
  { value: "this-month", label: "Due this month"},
];

interface Project { id: string; name: string; }

export function MilestoneOverviewFilters({ projects }: { projects: Project[] }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams= useSearchParams();
  const [, start]   = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    start(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Project filter */}
      <select
        value={searchParams.get("project") ?? ""}
        onChange={(e) => update("project", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Due date filter */}
      <select
        value={searchParams.get("due") ?? ""}
        onChange={(e) => update("due", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {DUE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
