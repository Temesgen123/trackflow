// lib/services/project.ts — Project business logic

import { db } from "@/lib/db";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/schemas";

export async function getProjectsByOwner(ownerId: string) {
  return db.project.findMany({
    where: { ownerId },
    include: {
      phases: {
        orderBy: { orderIndex: "asc" },
        include: { _count: { select: { milestones: true } } },
      },
      _count: { select: { phases: true, sprints: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string, ownerId: string) {
  return db.project.findFirst({
    where: { id, ownerId },
    include: {
      phases: {
        orderBy: { orderIndex: "asc" },
        include: {
          milestones: {
            include: {
              tasks: {
                include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
              },
              _count: { select: { tasks: true } },
            },
          },
          _count: { select: { milestones: true } },
        },
      },
      sprints: { orderBy: { startDate: "desc" } },
    },
  });
}

export async function createProject(ownerId: string, data: CreateProjectInput) {
  return db.project.create({
    data: {
      ownerId,
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
}

export async function updateProject(id: string, ownerId: string, data: UpdateProjectInput) {
  return db.project.updateMany({
    where: { id, ownerId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
}

export async function deleteProject(id: string, ownerId: string) {
  return db.project.deleteMany({ where: { id, ownerId } });
}

// Calculates overall project progress from phase statuses
export function calcProjectProgress(phases: { status: string }[]): number {
  if (!phases.length) return 0;
  const done = phases.filter((p) => p.status === "DONE").length;
  return Math.round((done / phases.length) * 100);
}
