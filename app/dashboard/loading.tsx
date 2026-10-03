// app/dashboard/loading.tsx — Shown while dashboard page loads
import { AppShell } from "@/components/layout/app-shell";
import { StatCardSkeleton, ProjectCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[1,2,3].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
      </div>
    </AppShell>
  );
}
