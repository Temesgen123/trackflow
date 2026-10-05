// app/tasks/[id]/page.tsx — Task detail page
// Next.js 15: params is a Promise

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const task = await db.task.findUnique({ where: { id }, select: { title: true } });
  return { title: task?.title ?? "Task" };
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const task = await db.task.findFirst({
    where: {
      id,
      milestone: { phase: { project: { ownerId: session.user.id } } },
    },
    include: {
      assignee:  { select: { id: true, name: true, email: true, avatarUrl: true } },
      sprint:    { select: { id: true, name: true, status: true } },
      milestone: {
        select: {
          id: true, name: true,
          phase: {
            select: {
              id: true, name: true,
              project: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!task) notFound();

  // For assignee dropdown
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  // For sprint dropdown
  const sprints = await db.sprint.findMany({
    where: {
      project: { ownerId: session.user.id },
      status: { in: ["ACTIVE", "PLANNED"] },
    },
    select: { id: true, name: true, status: true },
    orderBy: { startDate: "asc" },
  });

  const project  = task.milestone?.phase.project;
  const phase    = task.milestone?.phase;
  const milestone= task.milestone;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          {project && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <Link href={`/projects/${project.id}`} className="hover:text-foreground transition-colors truncate max-w-32">
                {project.name}
              </Link>
            </>
          )}
          {phase && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-32">{phase.name}</span>
            </>
          )}
          {milestone && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-32">{milestone.name}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-48">{task.title}</span>
        </div>

        <TaskDetailPanel task={task as any} users={users} sprints={sprints} />
      </div>
    </AppShell>
  );
}
