// components/ui/skeleton.tsx — Reusable skeleton primitives
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

// ── Composed skeletons ────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-56" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <Skeleton className="h-4 w-4 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-14" />
      <Skeleton className="h-7 w-20 rounded-md" />
    </div>
  );
}

export function MilestoneRowSkeleton() {
  return (
    <div className="flex items-start gap-4 border-b px-5 py-4">
      <Skeleton className="h-4 w-4 rounded mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-1.5 w-48 rounded-full" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function PhaseCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-1.5 w-full rounded-full" />
        <MilestoneRowSkeleton />
        <MilestoneRowSkeleton />
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>
      <div className="rounded-xl border bg-muted/40 p-2 min-h-[320px] space-y-2">
        {[1,2,3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-3 space-y-2 shadow-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-48" />
        {[1,2,3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
