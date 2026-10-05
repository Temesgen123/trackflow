// app/board/page.tsx — Sprint Kanban board (responsive)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, FolderKanban } from "lucide-react";

export const metadata = { title: "Sprint Board" };

export default async function BoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const activeSprint = await db.sprint.findFirst({
    where: { status: "ACTIVE", project: { ownerId: session.user.id } },
    include: {
      project: { select: { id: true, name: true } },
      tasks: {
        include: {
          assignee:  { select: { id: true, name: true, avatarUrl: true } },
          milestone: { select: { id: true, name: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  const allSprints = await db.sprint.findMany({
    where: { project: { ownerId: session.user.id }, status: { not: "COMPLETED" } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { startDate: "asc" },
    take: 10,
  });

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sprint Board</h1>
            {activeSprint ? (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{activeSprint.name}</span>
                  {" · "}
                  <Link href={`/projects/${activeSprint.project.id}`} className="hover:text-foreground transition-colors">
                    {activeSprint.project.name}
                  </Link>
                </p>
                {activeSprint.startDate && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(activeSprint.startDate), "MMM d")} → {format(new Date(activeSprint.endDate), "MMM d")}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">No active sprint</p>
            )}
          </div>
          {activeSprint && (
            <Link
              href={`/projects/${activeSprint.project.id}/sprints`}
              className="inline-flex items-center gap-1 rounded-md border bg-card px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm shrink-0"
            >
              Manage →
            </Link>
          )}
        </div>

        {/* Planned sprint chips */}
        {allSprints.filter((s) => s.id !== activeSprint?.id).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {allSprints.filter((s) => s.id !== activeSprint?.id).map((s) => (
              <Link
                key={s.id}
                href={`/projects/${s.project.id}/sprints`}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
              >
                <FolderKanban className="h-3 w-3 text-muted-foreground" />
                {s.name}
                <span className="text-muted-foreground">· {s.project.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Board — horizontally scrollable on mobile */}
        {activeSprint ? (
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 pb-4">
            <div className="min-w-[640px]">
              <KanbanBoard
                initialTasks={activeSprint.tasks as any}
                sprintId={activeSprint.id}
                sprintName={activeSprint.name}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 sm:p-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No active sprint</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Start a sprint from your project page to see tasks here.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to projects →
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
