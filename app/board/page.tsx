// app/board/page.tsx — Sprint Kanban board
// Next.js 15: Server Component fetches data; KanbanBoard is "use client"

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { KanbanBoard } from "@/components/tasks/kanban-board";

export const metadata = { title: "Sprint Board" };

export default async function BoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch the active sprint + its tasks for this user's projects
  const activeSprint = await db.sprint.findFirst({
    where: {
      status: "ACTIVE",
      project: { ownerId: session.user.id },
    },
    include: {
      project: { select: { id: true, name: true } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          milestone: { select: { id: true, name: true } },
        },
        orderBy: { priority: "desc" },
      },
    },
  });

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Sprint Board</h1>
          {activeSprint && (
            <p className="text-sm text-muted-foreground mt-1">
              {activeSprint.name} · {activeSprint.project.name}
              {activeSprint.goal && ` · "${activeSprint.goal}"`}
            </p>
          )}
        </div>
        {activeSprint ? (
          <KanbanBoard initialTasks={activeSprint.tasks as any} sprintId={activeSprint.id} />
        ) : (
          <div className="rounded-xl border border-dashed p-16 text-center">
            <p className="text-muted-foreground">No active sprint.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a sprint from your project page to see tasks here.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
