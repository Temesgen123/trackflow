// app/dashboard/page.tsx — Main dashboard with Reminders panel

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectsByOwner, calcProjectProgress } from "@/lib/services/project";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReminderPanel } from "@/components/reminders/reminder-panel";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import type { ProjectSummary } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [projects, reminders] = await Promise.all([
    getProjectsByOwner(session.user.id) as Promise<ProjectSummary[]>,
    db.reminder.findMany({
      where:   { userId: session.user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalPhases   = projects.reduce((acc, p) => acc + p._count.phases,  0);
  const activeSprints = projects.reduce((acc, p) => acc + p._count.sprints, 0);
  const pendingReminders = reminders.filter((r) => r.status === "PENDING").length;

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {session.user.name?.split(" ")[0]}
              {pendingReminders > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium">
                  · {pendingReminders} reminder{pendingReminders !== 1 ? "s" : ""} pending
                </span>
              )}
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New project
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Active projects", value: projects.filter((p) => p.status === "ACTIVE").length, color: "text-foreground" },
            { label: "Total phases",    value: totalPhases,   color: "text-primary"    },
            { label: "Sprints",         value: activeSprints, color: "text-green-600"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
              <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout: Projects + Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Projects — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Your projects</h2>
              <Link href="/projects" className="text-xs text-primary hover:underline">
                View all →
              </Link>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="h-7 w-7" />}
                title="No projects yet"
                description="Create your first project to start tracking phases, milestones and tasks."
                action={{ label: "+ New project", href: "/projects/new" }}
              />
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => {
                  const progress = calcProjectProgress(project.phases);
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                            <StatusBadge status={project.status as any} />
                          </div>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {project._count.phases} phase{project._count.phases !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ProgressBar value={progress} showPercent />
                    </Link>
                  );
                })}
                {projects.length > 5 && (
                  <Link href="/projects" className="block text-center text-xs text-primary hover:underline py-2">
                    +{projects.length - 5} more projects
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Reminders — 1/3 width */}
          <div className="lg:col-span-1">
            <ReminderPanel initialReminders={reminders as any} />
          </div>

        </div>
      </div>
    </AppShell>
  );
}
