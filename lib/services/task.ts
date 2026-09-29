// lib/services/task.ts

import { db } from "@/lib/db";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations/schemas";

export async function getTasksByMilestone(milestoneId: string) {
  return db.task.findMany({
    where: { milestoneId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      sprint: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTasksByProject(projectId: string) {
  return db.task.findMany({
    where: { milestone: { phase: { projectId } } },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      milestone: { select: { id: true, name: true } },
      sprint: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTasksBySprint(sprintId: string) {
  return db.task.findMany({
    where: { sprintId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      milestone: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }],
  });
}

export async function createTask(milestoneId: string, data: CreateTaskInput) {
  return db.task.create({
    data: {
      milestoneId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      assigneeId: data.assigneeId ?? null,
      sprintId: data.sprintId ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function updateTask(id: string, data: UpdateTaskInput) {
  return db.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      sprint: { select: { id: true, name: true } },
    },
  });
}

export async function deleteTask(id: string) {
  return db.task.delete({ where: { id } });
}
