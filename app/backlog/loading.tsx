// app/backlog/loading.tsx
import { AppShell } from "@/components/layout/app-shell";
import { StatCardSkeleton, TaskRowSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BacklogLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mb-4 flex gap-3">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
            <Skeleton className="h-3 w-20" />
          </div>
          {[1,2,3,4,5,6].map((i) => <TaskRowSkeleton key={i} />)}
        </div>
      </div>
    </AppShell>
  );
}
