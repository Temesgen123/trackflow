// app/reports/loading.tsx
import { AppShell } from "@/components/layout/app-shell";
import { ReportSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-52" />
        </div>
        <ReportSkeleton />
      </div>
    </AppShell>
  );
}
