// components/backlog/backlog-filters.tsx — Responsive
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH",   label: "High"   },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW",    label: "Low"    },
];

const STATUS_OPTIONS = [
  { value: "",            label: "All statuses"  },
  { value: "TODO",        label: "To do"         },
  { value: "IN_PROGRESS", label: "In progress"   },
  { value: "IN_REVIEW",   label: "In review"     },
  { value: "BLOCKED",     label: "Blocked"       },
];

const SPRINT_OPTIONS = [
  { value: "",           label: "All tasks"          },
  { value: "unassigned", label: "Unassigned only"    },
  { value: "assigned",   label: "Assigned to sprint" },
];

export function BacklogFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, start]    = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    start(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {/* Search — full width on mobile */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks…"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-md border bg-background pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Selects — row on mobile too, each takes 1/3 */}
      <div className="flex gap-2 flex-1 sm:flex-none">
        <select
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => updateParam("priority", e.target.value)}
          className="flex-1 sm:flex-none rounded-md border bg-background px-2 sm:px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="flex-1 sm:flex-none rounded-md border bg-background px-2 sm:px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={searchParams.get("sprint") ?? ""}
          onChange={(e) => updateParam("sprint", e.target.value)}
          className="flex-1 sm:flex-none rounded-md border bg-background px-2 sm:px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {SPRINT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
