// app/milestones/loading.tsx
import { AppShell } from "@/components/layout/app-shell";
import { StatCardSkeleton, MilestoneRowSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function MilestonesLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="mb-6 grid grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mb-5 flex gap-3">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-9 w-36 rounded-md" />)}
        </div>
        <div className="space-y-6">
          {[1,2].map((group) => (
            <div key={group}>
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="rounded-xl border bg-card overflow-hidden">
                {[1,2,3].map((i) => <MilestoneRowSkeleton key={i} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
