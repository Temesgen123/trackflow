// app/projects/[id]/sprints/page.tsx — Sprint management page
// Next.js 15: params is a Promise

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { SprintCard } from "@/components/sprints/sprint-card";
import { CreateSprintButton } from "@/components/sprints/create-sprint-button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project ? `Sprints — ${project.name}` : "Sprints" };
}

export default async function SprintsPage({ params }: Props) {
  const { id: projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
    select: { id: true, name: true },
  });
  if (!project) notFound();

  const sprints = await db.sprint.findMany({
    where: { projectId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { startDate: "desc" },
  });

  const hasActiveSprint = sprints.some((s) => s.status === "ACTIVE");
  const activeSprint    = sprints.find((s) => s.status === "ACTIVE");
  const plannedSprints  = sprints.filter((s) => s.status === "PLANNED");
  const completedSprints= sprints.filter((s) => s.status === "COMPLETED");

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/projects/${projectId}`} className="hover:text-foreground transition-colors">
            {project.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Sprints</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sprints</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage 2-week sprints for <span className="font-medium">{project.name}</span>
            </p>
          </div>
          <CreateSprintButton projectId={projectId} />
        </div>

        {/* Summary bar */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{activeSprint ? 1 : 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
            <p className="text-2xl font-bold">{plannedSprints.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Planned</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{completedSprints.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
          </div>
        </div>

        {/* Sprint list */}
        {sprints.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground text-sm">No sprints yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first sprint to start tracking work.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active sprint first */}
            {activeSprint && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Active
                </p>
                <SprintCard
                  sprint={activeSprint as any}
                  hasActiveSprint={hasActiveSprint}
                />
              </div>
            )}

            {/* Planned sprints */}
            {plannedSprints.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-4">
                  Planned
                </p>
                <div className="space-y-3">
                  {plannedSprints.map((s) => (
                    <SprintCard
                      key={s.id}
                      sprint={s as any}
                      hasActiveSprint={hasActiveSprint}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed sprints */}
            {completedSprints.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-4">
                  Completed
                </p>
                <div className="space-y-3">
                  {completedSprints.map((s) => (
                    <SprintCard
                      key={s.id}
                      sprint={s as any}
                      hasActiveSprint={hasActiveSprint}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
