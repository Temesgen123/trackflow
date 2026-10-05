// app/projects/page.tsx — Responsive projects list
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectsByOwner } from "@/lib/services/project";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { calcProjectProgress } from "@/lib/services/project";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await getProjectsByOwner(session.user.id);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Projects</h1>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 sm:px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New project</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-7 w-7" />}
            title="No projects yet"
            description="Create your first project to start tracking work."
            action={{ label: "+ New project", href: "/projects/new" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => {
              const progress = calcProjectProgress(project.phases);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow block"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h2 className="font-semibold leading-tight text-sm sm:text-base">{project.name}</h2>
                    <StatusBadge status={project.status as any} />
                  </div>
                  {project.description && (
                    <p className="mb-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <ProgressBar value={progress} showPercent />
                  <p className="mt-3 text-xs text-muted-foreground">
                    {project._count.phases} phases · {project._count.sprints} sprints
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
