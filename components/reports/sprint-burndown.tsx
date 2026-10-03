// components/reports/sprint-burndown.tsx
'use client';

import { useMemo } from 'react';
import {
  format,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
} from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  status: string;
  updatedAt: string;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

export function SprintBurndown({ sprint }: { sprint: Sprint }) {
  const days = useMemo(() => {
    const start = startOfDay(new Date(sprint.startDate));
    const end = startOfDay(new Date(sprint.endDate));
    const today = startOfDay(new Date());
    const endDay = isAfter(today, end) ? end : today;

    if (isAfter(start, endDay)) return [];

    return eachDayOfInterval({ start, end: endDay });
  }, [sprint.startDate, sprint.endDate]);

  const totalTasks = sprint.tasks.length;

  // For each day, count remaining (not done) tasks
  const burnData = useMemo(() => {
    return days.map((day) => {
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59);

      const doneByDay = sprint.tasks.filter((t) => {
        if (t.status !== 'DONE') return false;
        const updated = startOfDay(new Date(t.updatedAt));
        return !isAfter(updated, day);
      }).length;

      return {
        label: format(day, 'MMM d'),
        remaining: totalTasks - doneByDay,
        done: doneByDay,
      };
    });
  }, [days, sprint.tasks, totalTasks]);

  // Ideal burndown line
  const idealData = useMemo(() => {
    const totalDays = eachDayOfInterval({
      start: new Date(sprint.startDate),
      end: new Date(sprint.endDate),
    }).length;

    return days.map((_, i) => {
      const dayIndex = i;
      return Math.round(
        totalTasks - (totalTasks / (totalDays - 1 || 1)) * dayIndex,
      );
    });
  }, [days, totalTasks, sprint.startDate, sprint.endDate]);

  if (burnData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">
          Sprint Burndown — {sprint.name}
        </h3>
        <p className="text-sm text-muted-foreground italic">
          Sprint hasn&apos;t started yet.
        </p>
      </div>
    );
  }

  const maxY = totalTasks;
  const chartH = 160;
  const chartW = 520;
  const padL = 36;
  const padB = 28;
  const padR = 12;
  const padT = 12;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padB - padT;
  const numDays = burnData.length;
  const xStep = numDays > 1 ? innerW / (numDays - 1) : innerW;

  function xPos(i: number) {
    return padL + i * xStep;
  }
  function yPos(val: number) {
    return padT + innerH - (maxY > 0 ? (val / maxY) * innerH : 0);
  }

  const actualPath = burnData
    .map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(d.remaining).toFixed(1)}`,
    )
    .join(' ');

  const idealPath = idealData
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`,
    )
    .join(' ');

  // Y-axis ticks
  const yTicks = [0, Math.round(maxY / 2), maxY].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  );

  // X labels — show every 2nd day if many days
  const showLabel = (i: number) =>
    numDays <= 8 || i % 2 === 0 || i === numDays - 1;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">
          Sprint Burndown — {sprint.name}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-full bg-primary" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-full bg-muted-foreground/40" />
            Ideal
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          style={{ minWidth: '300px' }}
        >
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padL}
                y1={yPos(tick)}
                x2={chartW - padR}
                y2={yPos(tick)}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x={padL - 4}
                y={yPos(tick)}
                textAnchor="end"
                dominantBaseline="central"
                className="fill-muted-foreground"
                style={{ fontSize: '9px' }}
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {burnData.map((d, i) =>
            showLabel(i) ? (
              <text
                key={i}
                x={xPos(i)}
                y={chartH - 6}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: '9px' }}
              >
                {d.label}
              </text>
            ) : null,
          )}

          {/* Ideal line */}
          <path
            d={idealPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />

          {/* Actual area fill */}
          <path
            d={`${actualPath} L${xPos(numDays - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${padL.toFixed(1)},${(padT + innerH).toFixed(1)} Z`}
            fill="#3B82F6"
            fillOpacity="0.08"
          />

          {/* Actual line */}
          <path
            d={actualPath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {burnData.map((d, i) => (
            <circle
              key={i}
              cx={xPos(i)}
              cy={yPos(d.remaining)}
              r="3"
              fill="#3B82F6"
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>

      {/* Summary row */}
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground border-t pt-3">
        <span>
          Total tasks: <strong className="text-foreground">{totalTasks}</strong>
        </span>
        <span>
          Done:{' '}
          <strong className="text-green-600">
            {burnData[burnData.length - 1]?.done ?? 0}
          </strong>
        </span>
        <span>
          Remaining:{' '}
          <strong className="text-foreground">
            {burnData[burnData.length - 1]?.remaining ?? totalTasks}
          </strong>
        </span>
      </div>
    </div>
  );
}
