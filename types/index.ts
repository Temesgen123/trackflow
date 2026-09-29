// types/index.ts — Shared TypeScript types for TrackFlow

import type {
  Project,
  Phase,
  Milestone,
  Task,
  Sprint,
  User,
  ProjectStatus,
  PhaseStatus,
  MilestoneStatus,
  TaskStatus,
  TaskPriority,
  SprintStatus,
} from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────
export type {
  ProjectStatus,
  PhaseStatus,
  MilestoneStatus,
  TaskStatus,
  TaskPriority,
  SprintStatus,
};

// ─── Slim user type for assignee display ──────────────────────
export type UserSlim = Pick<User, "id" | "name" | "avatarUrl">;

// ─── Enriched types returned by services ─────────────────────
export type TaskWithAssignee = Task & {
  assignee: UserSlim | null;
  sprint: Pick<Sprint, "id" | "name"> | null;
};

export type MilestoneWithTasks = Milestone & {
  tasks: TaskWithAssignee[];
  _count: { tasks: number };
};

export type PhaseWithMilestones = Phase & {
  milestones: MilestoneWithTasks[];
  _count: { milestones: number };
};

export type ProjectWithPhases = Project & {
  owner: UserSlim;
  phases: PhaseWithMilestones[];
  sprints: Sprint[];
};

export type ProjectSummary = Project & {
  phases: (Phase & { _count: { milestones: number } })[];
  _count: { phases: number; sprints: number };
};

// ─── API response wrapper ─────────────────────────────────────
export type ApiSuccess<T> = { data: T; error: null };
export type ApiError = { data: null; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(data: T): ApiSuccess<T> {
  return { data, error: null };
}
export function err(error: string): ApiError {
  return { data: null, error };
}

// ─── Status display maps ──────────────────────────────────────
export const STATUS_LABELS: Record<TaskStatus | PhaseStatus | MilestoneStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  BLOCKED: "Blocked",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const STATUS_COLORS: Record<TaskStatus | PhaseStatus | MilestoneStatus, string> = {
  TODO: "bg-gray-100 text-gray-700 border-gray-300",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW: "bg-orange-50 text-orange-700 border-orange-200",
  DONE: "bg-green-50 text-green-700 border-green-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-amber-500",
  HIGH: "text-red-500",
  URGENT: "text-purple-600",
};
