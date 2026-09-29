// lib/services/phase.ts

import { db } from "@/lib/db";
import type { CreatePhaseInput, UpdatePhaseInput } from "@/lib/validations/schemas";

export async function getPhasesByProject(projectId: string) {
  return db.phase.findMany({
    where: { projectId },
    orderBy: { orderIndex: "asc" },
    include: {
      milestones: {
        include: { _count: { select: { tasks: true } } },
      },
    },
  });
}

export async function createPhase(projectId: string, data: CreatePhaseInput) {
  const maxOrder = await db.phase.aggregate({
    where: { projectId },
    _max: { orderIndex: true },
  });
  return db.phase.create({
    data: {
      projectId,
      name: data.name,
      description: data.description,
      orderIndex: data.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
}

export async function updatePhase(id: string, data: UpdatePhaseInput) {
  return db.phase.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
}

export async function deletePhase(id: string) {
  return db.phase.delete({ where: { id } });
}
