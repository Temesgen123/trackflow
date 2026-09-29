// app/projects/[id]/page.tsx — Project detail with full phase/milestone/task management
// Next.js 15: params is a Promise

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectById } from "@/lib/services/project";
import { calcProjectProgress } from "@/lib/utils/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PhaseList } from "@/components/phases/phase-list";
import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return {};
  const project = await getProjectById(id, session.user.id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getProjectById(id, session.user.id);
  if (!project) notFound();

  const overallProgress = calcProjectProgress(project.phases);
  const totalTasks = project.phases
    .flatMap((p) => p.milestones)
    .flatMap((m) => m.tasks).length;
  const doneTasks = project.phases
    .flatMap((p) => p.milestones)
    .flatMap((m) => m.tasks)
    .filter((t) => t.status === "DONE").length;

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate">{project.name}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status as any} />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {project.startDate && format(new Date(project.startDate), "MMM d, yyyy")}
                {project.startDate && project.endDate && " → "}
                {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold">{project.phases.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Phases</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-primary">{doneTasks}/{totalTasks}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tasks done</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold" style={{ color: overallProgress === 100 ? "#22C55E" : undefined }}>
              {overallProgress}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Overall progress</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-8 rounded-xl border bg-card p-4 shadow-sm">
          <ProgressBar label="Overall progress" value={overallProgress} />
        </div>

        {/* Phase list (interactive) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Phases</h2>
          <span className="text-xs text-muted-foreground">
            Click a phase to expand milestones and tasks
          </span>
        </div>

        <PhaseList phases={project.phases as any} projectId={project.id} />
      </div>
    </AppShell>
  );
}
