// lib/services/milestone.ts

import { db } from "@/lib/db";
import type { CreateMilestoneInput, UpdateMilestoneInput } from "@/lib/validations/schemas";

export async function getMilestonesByPhase(phaseId: string) {
  return db.milestone.findMany({
    where: { phaseId },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMilestone(phaseId: string, data: CreateMilestoneInput) {
  return db.milestone.create({
    data: {
      phaseId,
      name: data.name,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

export async function updateMilestone(id: string, data: UpdateMilestoneInput) {
  return db.milestone.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
}

export async function deleteMilestone(id: string) {
  return db.milestone.delete({ where: { id } });
}

export function calcMilestoneProgress(tasks: { status: string }[]): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}
