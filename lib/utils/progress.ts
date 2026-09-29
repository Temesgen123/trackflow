// lib/utils/progress.ts — Progress calculation helpers

export function calcMilestoneProgress(tasks: { status: string }[]): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export function calcPhaseProgress(milestones: { tasks: { status: string }[] }[]): number {
  const allTasks = milestones.flatMap((m) => m.tasks);
  return calcMilestoneProgress(allTasks);
}

export function calcProjectProgress(phases: { status: string }[]): number {
  if (!phases.length) return 0;
  const done = phases.filter((p) => p.status === "DONE").length;
  return Math.round((done / phases.length) * 100);
}
