// app/projects/[id]/loading.tsx
import { AppShell } from "@/components/layout/app-shell";
import { StatCardSkeleton, PhaseCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-4 w-48 mb-4" />
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mb-8 rounded-xl border bg-card p-4">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="h-5 w-16 mb-4" />
        <div className="space-y-3">
          {[1,2].map((i) => <PhaseCardSkeleton key={i} />)}
        </div>
      </div>
    </AppShell>
  );
}
