// app/backlog/page.tsx — Product backlog: all tasks across all projects
// Supports filtering by priority, status, sprint assignment
// Next.js 15: searchParams is a Promise

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { BacklogTaskRow } from "@/components/backlog/backlog-task-row";
import { BacklogFilters } from "@/components/backlog/backlog-filters";
import { Suspense } from "react";
import { ListTodo } from "lucide-react";

export const metadata = { title: "Backlog" };

type SearchParams = Promise<{
  q?: string;
  priority?: string;
  status?: string;
  sprint?: string;
}>;

export default async function BacklogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q, priority, status, sprint } = await searchParams;

  // Build prisma where clause
  const where: any = {
    milestone: { phase: { project: { ownerId: session.user.id } } },
    // Exclude DONE tasks from backlog by default
    NOT: { status: "DONE" },
  };

  if (q)        where.title    = { contains: q, mode: "insensitive" };
  if (priority) where.priority = priority;
  if (status)   where.status   = status;
  if (sprint === "unassigned") where.sprintId = null;
  if (sprint === "assigned")   where.sprintId = { not: null };

  const tasks = await db.task.findMany({
    where,
    include: {
      assignee:  { select: { id: true, name: true, avatarUrl: true } },
      sprint:    { select: { id: true, name: true } },
      milestone: {
        select: {
          id: true, name: true,
          phase: { select: { name: true } },
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
  });

  // Sprints for the assign dropdown
  const sprints = await db.sprint.findMany({
    where: {
      project: { ownerId: session.user.id },
      status: { in: ["ACTIVE", "PLANNED"] },
    },
    select: { id: true, name: true, status: true },
    orderBy: { startDate: "asc" },
  });

  // Stats
  const unassigned = tasks.filter((t) => !t.sprintId).length;
  const assigned   = tasks.filter((t) =>  t.sprintId).length;
  const urgent     = tasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length;

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Backlog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All tasks across your projects — drag to a sprint or assign here
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold">{tasks.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total tasks</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-500">{unassigned}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Unassigned</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-500">{urgent}</p>
            <p className="text-xs text-muted-foreground mt-0.5">High / Urgent</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <Suspense>
            <BacklogFilters />
          </Suspense>
        </div>

        {/* Task list */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
            <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Task
            </span>
            <span className="hidden sm:block w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Status
            </span>
            <span className="hidden md:block w-16 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Priority
            </span>
            <span className="w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Sprint
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ListTodo className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {q || priority || status || sprint
                  ? "Try adjusting your filters"
                  : "Create tasks inside your project phases and milestones"}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <BacklogTaskRow
                key={task.id}
                task={task as any}
                sprints={sprints}
              />
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground text-right">
            Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""} · Done tasks hidden
          </p>
        )}
      </div>
    </AppShell>
  );
}
