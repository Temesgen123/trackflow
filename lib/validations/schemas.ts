// lib/validations/schemas.ts — Zod schemas for all entities

import { z } from 'zod';

// ─── Project ──────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional()
    .nullable(),
});

// ─── Phase ───────────────────────────────────────────────────
export const createPhaseSchema = z.object({
  name: z.string().min(1, 'Phase name is required').max(100),
  description: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
});

export const updatePhaseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])
    .optional(),
  orderIndex: z.number().int().min(0).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional()
    .nullable(),
});

// ─── Milestone ───────────────────────────────────────────────
export const createMilestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(100),
  description: z.string().max(500).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
});

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional()
    .nullable(),
});

// ─── Task ────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  sprintId: z.string().uuid().optional().nullable(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional()
    .nullable(),
});

// ─── Sprint ──────────────────────────────────────────────────
export const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').max(100),
  goal: z.string().max(500).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date'),
});

export const updateSprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(500).optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED']).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Invalid date')
    .optional(),
});

// ─── Types ───────────────────────────────────────────────────
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
