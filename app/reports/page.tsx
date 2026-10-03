// app/reports/page.tsx — Reports & analytics page

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import {
  HorizontalBarChart,
  DonutChart,
  StatCard,
} from "@/components/reports/progress-chart";
import { SprintBurndown } from "@/components/reports/sprint-burndown";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ownerId = session.user.id;

  // ── Fetch all data ───────────────────────────────────────────
  const projects = await db.project.findMany({
    where: { ownerId },
    include: {
      phases: {
        include: {
          milestones: {
            include: { tasks: { select: { id: true, status: true, priority: true } } },
          },
        },
      },
      sprints: {
        orderBy: { startDate: "desc" },
        take: 5,
        include: {
          tasks: { select: { id: true, status: true } },
        },
      },
    },
  });

  // ── Aggregate stats ──────────────────────────────────────────
  const allPhases     = projects.flatMap((p) => p.phases);
  const allMilestones = allPhases.flatMap((ph) => ph.milestones);
  const allTasks      = allMilestones.flatMap((m) => m.tasks);
  const allSprints    = projects.flatMap((p) => p.sprints);

  const totalProjects   = projects.length;
  const activeProjects  = projects.filter((p) => p.status === "ACTIVE").length;
  const totalTasks      = allTasks.length;
  const doneTasks       = allTasks.filter((t) => t.status === "DONE").length;
  const blockedTasks    = allTasks.filter((t) => t.status === "BLOCKED").length;
  const urgentTasks     = allTasks.filter((t) => t.priority === "URGENT").length;
  const completionRate  = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const activeSprints   = allSprints.filter((s) => s.status === "ACTIVE").length;

  // ── Project progress bars ────────────────────────────────────
  const projectProgress = projects.map((p) => {
    const phasesArr = p.phases;
    const done      = phasesArr.filter((ph) => ph.status === "DONE").length;
    return { label: p.name, value: done, max: phasesArr.length || 1 };
  });

  // ── Task status donut ────────────────────────────────────────
  const taskStatusSegments = [
    { label: "Done",        value: allTasks.filter((t) => t.status === "DONE"       ).length, color: "#22C55E" },
    { label: "In progress", value: allTasks.filter((t) => t.status === "IN_PROGRESS").length, color: "#3B82F6" },
    { label: "In review",   value: allTasks.filter((t) => t.status === "IN_REVIEW"  ).length, color: "#F59E0B" },
    { label: "To do",       value: allTasks.filter((t) => t.status === "TODO"       ).length, color: "#94A3B8" },
    { label: "Blocked",     value: allTasks.filter((t) => t.status === "BLOCKED"    ).length, color: "#EF4444" },
  ].filter((s) => s.value > 0);

  // ── Priority donut ────────────────────────────────────────────
  const prioritySegments = [
    { label: "Urgent", value: allTasks.filter((t) => t.priority === "URGENT").length, color: "#7C3AED" },
    { label: "High",   value: allTasks.filter((t) => t.priority === "HIGH"  ).length, color: "#EF4444" },
    { label: "Medium", value: allTasks.filter((t) => t.priority === "MEDIUM").length, color: "#F59E0B" },
    { label: "Low",    value: allTasks.filter((t) => t.priority === "LOW"   ).length, color: "#22C55E" },
  ].filter((s) => s.value > 0);

  // ── Phase completion bars ────────────────────────────────────
  const phaseProgress = allPhases.map((ph) => {
    const phaseTasks = ph.milestones.flatMap((m) => m.tasks);
    const done       = phaseTasks.filter((t) => t.status === "DONE").length;
    return { label: ph.name, value: done, max: phaseTasks.length || 1 };
  }).slice(0, 8);

  // ── Sprint velocity (tasks completed per sprint) ─────────────
  const sprintVelocity = allSprints
    .filter((s) => s.status === "COMPLETED" || s.status === "ACTIVE")
    .slice(0, 6)
    .map((s) => ({
      label: s.name,
      value: s.tasks.filter((t) => t.status === "DONE").length,
      max:   s.tasks.length || 1,
    }));

  // Most recent active sprint for burndown
  const activeSprint = await db.sprint.findFirst({
    where: { project: { ownerId }, status: "ACTIVE" },
    include: {
      tasks: { select: { id: true, status: true, createdAt: true, updatedAt: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of all your projects, phases, and tasks
          </p>
        </div>

        {/* Top stat cards */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Active projects"
            value={activeProjects}
            sub={`${totalProjects} total`}
            color="text-foreground"
          />
          <StatCard
            label="Task completion"
            value={`${completionRate}%`}
            sub={`${doneTasks} of ${totalTasks} done`}
            color={completionRate === 100 ? "text-green-600" : "text-primary"}
          />
          <StatCard
            label="Blocked tasks"
            value={blockedTasks}
            sub={blockedTasks > 0 ? "Needs attention" : "All clear"}
            color={blockedTasks > 0 ? "text-red-500" : "text-green-600"}
          />
          <StatCard
            label="Active sprints"
            value={activeSprints}
            sub={`${allSprints.length} total`}
            color="text-blue-600"
          />
        </div>

        {/* Donuts row */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DonutChart title="Task status breakdown" segments={taskStatusSegments} />
          <DonutChart title="Task priority breakdown" segments={prioritySegments} />
        </div>

        {/* Project progress */}
        <div className="mb-6">
          <HorizontalBarChart
            title="Project progress (phases completed)"
            data={projectProgress}
            emptyMessage="No projects yet"
          />
        </div>

        {/* Phase progress */}
        {phaseProgress.length > 0 && (
          <div className="mb-6">
            <HorizontalBarChart
              title="Phase progress (tasks completed)"
              data={phaseProgress}
              emptyMessage="No phases yet"
            />
          </div>
        )}

        {/* Sprint velocity */}
        {sprintVelocity.length > 0 && (
          <div className="mb-6">
            <HorizontalBarChart
              title="Sprint velocity (tasks done per sprint)"
              data={sprintVelocity}
            />
          </div>
        )}

        {/* Burndown */}
        {activeSprint && (
          <div className="mb-6">
            <SprintBurndown sprint={activeSprint as any} />
          </div>
        )}

        {/* Urgent tasks callout */}
        {urgentTasks > 0 && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
              <h3 className="text-sm font-semibold text-purple-800">
                {urgentTasks} urgent task{urgentTasks !== 1 ? "s" : ""}
              </h3>
            </div>
            <p className="text-sm text-purple-700">
              You have urgent tasks that need immediate attention.
              Check the <a href="/backlog" className="underline font-medium">backlog</a> to prioritise.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
