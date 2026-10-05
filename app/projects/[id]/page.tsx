// app/projects/[id]/page.tsx — Responsive project detail
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectById } from "@/lib/services/project";
import { calcProjectProgress } from "@/lib/utils/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PhaseList } from "@/components/phases/phase-list";
import Link from "next/link";
import { ChevronRight, Calendar, Layers, Timer, Pencil } from "lucide-react";
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
  const totalTasks = project.phases.flatMap((p) => p.milestones).flatMap((m) => m.tasks).length;
  const doneTasks  = project.phases.flatMap((p) => p.milestones).flatMap((m) => m.tasks).filter((t) => t.status === "DONE").length;
  const activeSprint = project.sprints.find((s) => s.status === "ACTIVE");

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-wrap">
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{project.name}</span>
        </div>

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status as any} />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {project.startDate && format(new Date(project.startDate), "MMM d, yyyy")}
                {project.startDate && project.endDate && " → "}
                {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
              </div>
            )}
          </div>
          <Link
            href={`/projects/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 sm:px-3 py-2 text-sm font-medium hover:bg-muted transition-colors shadow-sm shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>

        {/* Quick-action links */}
        <div className="mb-5 flex gap-2 flex-wrap">
          <Link
            href={`/projects/${id}/sprints`}
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm"
          >
            <Timer className="h-3.5 w-3.5 text-primary" />
            Sprints
            {activeSprint && (
              <span className="ml-1 rounded-full bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 font-semibold">
                Active
              </span>
            )}
          </Link>
          <Link
            href="/board"
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-primary" />
            Board
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
            <p className="text-xl sm:text-2xl font-bold">{project.phases.length}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Phases</p>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
            <p className="text-xl sm:text-2xl font-bold text-primary">{doneTasks}/{totalTasks}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Tasks done</p>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-sm">
            <p className="text-xl sm:text-2xl font-bold" style={{ color: overallProgress === 100 ? "#22C55E" : undefined }}>
              {overallProgress}%
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Progress</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
          <ProgressBar label="Overall progress" value={overallProgress} />
        </div>

        {/* Phases */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold">Phases</h2>
          <span className="text-xs text-muted-foreground hidden sm:block">Click a phase to expand</span>
        </div>
        <PhaseList phases={project.phases as any} projectId={project.id} />
      </div>
    </AppShell>
  );
}
