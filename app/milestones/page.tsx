// app/milestones/page.tsx — Global milestones overview across all projects
// Next.js 15: searchParams is a Promise

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { MilestoneOverviewList } from "@/components/milestones/milestone-overview-list";
import { Suspense } from "react";
import { MilestoneOverviewFilters } from "@/components/milestones/milestone-overview-filters";

export const metadata = { title: "Milestones" };

type SearchParams = Promise<{
  status?: string;
  project?: string;
  due?: string;
}>;

export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status, project: projectFilter, due } = await searchParams;

  // Build where clause
  const where: any = {
    phase: { project: { ownerId: session.user.id } },
  };
  if (status)        where.status    = status;
  if (projectFilter) where.phase     = { project: { id: projectFilter, ownerId: session.user.id } };

  // Due filter
  const now = new Date();
  if (due === "overdue") {
    where.dueDate = { lt: now };
    where.NOT     = { status: "DONE" };
  } else if (due === "this-week") {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    where.dueDate = { gte: now, lte: weekEnd };
  } else if (due === "this-month") {
    const monthEnd = new Date(now);
    monthEnd.setDate(monthEnd.getDate() + 30);
    where.dueDate = { gte: now, lte: monthEnd };
  }

  const milestones = await db.milestone.findMany({
    where,
    include: {
      tasks: { select: { id: true, status: true } },
      phase: {
        select: {
          id: true, name: true,
          project: { select: { id: true, name: true, status: true } },
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { dueDate: "asc"  },
      { createdAt: "asc" },
    ],
  });

  // All projects for the filter dropdown
  const projects = await db.project.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Stats
  const total    = milestones.length;
  const done     = milestones.filter((m) => m.status === "DONE").length;
  const blocked  = milestones.filter((m) => m.status === "BLOCKED").length;
  const overdue  = milestones.filter((m) => {
    if (!m.dueDate || m.status === "DONE") return false;
    return new Date(m.dueDate) < now;
  }).length;
  const inProgress = milestones.filter((m) => m.status === "IN_PROGRESS").length;

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Milestones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All milestones across your projects
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: total,      color: "text-foreground"  },
            { label: "In progress", value: inProgress, color: "text-blue-600"    },
            { label: "Overdue",     value: overdue,    color: overdue > 0 ? "text-red-500" : "text-green-600" },
            { label: "Done",        value: done,       color: "text-green-600"   },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5">
          <Suspense>
            <MilestoneOverviewFilters projects={projects} />
          </Suspense>
        </div>

        {/* Milestone list */}
        <MilestoneOverviewList
          milestones={milestones as any}
          now={now.toISOString()}
        />
      </div>
    </AppShell>
  );
}
