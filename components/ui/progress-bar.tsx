// components/ui/progress-bar.tsx

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  className,
}: ProgressBarProps) {
  const color =
    value === 100
      ? "bg-green-500"
      : value >= 60
      ? "bg-blue-500"
      : value >= 30
      ? "bg-blue-400"
      : "bg-amber-400";

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-primary">{value}%</span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
