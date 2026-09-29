// app/dashboard/page.tsx — Main dashboard (Server Component)
// Next.js 15: fetch is cached by default; use cache: "no-store" for live data

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectsByOwner } from "@/lib/services/project";
import { calcProjectProgress } from "@/lib/services/project";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProjectSummary } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await getProjectsByOwner(session.user.id) as ProjectSummary[];

  const totalPhases = projects.reduce((acc, p) => acc + p._count.phases, 0);
  const activeSprints = projects.reduce((acc, p) => acc + p._count.sprints, 0);

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {session.user.name?.split(" ")[0]}
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Active projects", value: projects.filter(p => p.status === "ACTIVE").length, color: "text-foreground" },
            { label: "Total phases", value: totalPhases, color: "text-primary" },
            { label: "Sprints", value: activeSprints, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
              <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Projects list */}
        <h2 className="mb-4 text-base font-semibold">Your projects</h2>
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground text-sm">No projects yet.</p>
            <Link href="/projects/new" className="mt-3 inline-block text-sm text-primary hover:underline">
              Create your first project →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const progress = calcProjectProgress(project.phases);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold truncate">{project.name}</h3>
                        <StatusBadge status={project.status as any} />
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {project._count.phases} phase{project._count.phases !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar value={progress} showPercent />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
