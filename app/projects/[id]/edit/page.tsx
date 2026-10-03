// app/projects/[id]/edit/page.tsx
// Next.js 15: params is a Promise

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { EditProjectForm } from "@/components/projects/edit-project-form";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project ? `Edit — ${project.name}` : "Edit project" };
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await db.project.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true, name: true, description: true,
      status: true, startDate: true, endDate: true,
    },
  });
  if (!project) notFound();

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/projects/${id}`} className="hover:text-foreground transition-colors truncate max-w-48">
            {project.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Edit</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">Edit project</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Update project details or delete the project permanently.
        </p>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <EditProjectForm project={project as any} />
        </div>
      </div>
    </AppShell>
  );
}
