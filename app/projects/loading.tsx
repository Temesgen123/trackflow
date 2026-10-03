// app/projects/loading.tsx
import { AppShell } from "@/components/layout/app-shell";
import { ProjectCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2,3,4].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
      </div>
    </AppShell>
  );
}
