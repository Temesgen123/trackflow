// components/reports/progress-chart.tsx
"use client";

import { cn } from "@/lib/utils";

interface BarData {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function HorizontalBarChart({
  title,
  data,
  emptyMessage = "No data",
}: {
  title: string;
  data: BarData[];
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => {
            const pct = d.max > 0 ? Math.round((d.value / d.max) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm truncate max-w-[60%]">{d.label}</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {d.value}/{d.max} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      d.color ?? (pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-primary" : pct >= 30 ? "bg-amber-400" : "bg-red-400")
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DonutChart({
  title,
  segments,
}: {
  title: string;
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  // Build SVG arcs
  const arcs = segments.map((seg) => {
    const pct   = total > 0 ? seg.value / total : 0;
    const start = offset;
    offset += pct;
    return { ...seg, pct, start };
  });

  function polarToCartesian(cx: number, cy: number, r: number, anglePct: number) {
    const angle = anglePct * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  function arcPath(cx: number, cy: number, r: number, startPct: number, endPct: number) {
    if (endPct - startPct >= 1) endPct = startPct + 0.9999;
    const s = polarToCartesian(cx, cy, r, startPct);
    const e = polarToCartesian(cx, cy, r, endPct);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`;
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground italic">No data yet</p>
      ) : (
        <div className="flex items-center gap-6">
          {/* SVG donut */}
          <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
            {arcs.map((arc, i) =>
              arc.pct > 0 ? (
                <path
                  key={i}
                  d={arcPath(50, 50, 38, arc.start, arc.start + arc.pct)}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="16"
                  strokeLinecap="butt"
                />
              ) : null
            )}
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
              className="text-xs font-bold fill-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              {total}
            </text>
            <text x="50" y="62" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: "8px", fill: "#94a3b8" }}>
              total
            </text>
          </svg>

          {/* Legend */}
          <div className="space-y-2 flex-1 min-w-0">
            {arcs.map((arc, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: arc.color }}
                  />
                  <span className="text-xs truncate">{arc.label}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground shrink-0">
                  {arc.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StatCard({
  label, value, sub, color,
}: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className={cn("text-3xl font-bold tracking-tight", color ?? "text-foreground")}>
        {value}
      </p>
      <p className="text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
