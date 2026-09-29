// app/projects/new/page.tsx — Create new project page

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">Projects</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">New project</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Create a project</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Projects hold phases, milestones, and tasks. You can add team members after creation.
        </p>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <CreateProjectForm />
        </div>
      </div>
    </AppShell>
  );
}
