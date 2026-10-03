// app/board/loading.tsx
import { AppShell } from "@/components/layout/app-shell";
import { KanbanColumnSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BoardLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <KanbanColumnSkeleton key={i} />)}
        </div>
      </div>
    </AppShell>
  );
}
