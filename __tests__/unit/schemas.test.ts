// __tests__/unit/schemas.test.ts
import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  createTaskSchema,
  createPhaseSchema,
  createMilestoneSchema,
  createSprintSchema,
} from "@/lib/validations/schemas";

describe("createProjectSchema", () => {
  it("accepts a valid project", () => {
    const result = createProjectSchema.safeParse({
      name: "My Project",
      description: "A description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = createProjectSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts valid date strings", () => {
    const result = createProjectSchema.safeParse({
      name: "Project",
      startDate: "2025-01-01",
      endDate: "2025-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date strings", () => {
    const result = createProjectSchema.safeParse({
      name: "Project",
      startDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("works without optional fields", () => {
    const result = createProjectSchema.safeParse({ name: "Minimal" });
    expect(result.success).toBe(true);
  });
});

describe("createTaskSchema", () => {
  it("accepts a valid task", () => {
    const result = createTaskSchema.safeParse({
      title:    "Build auth",
      priority: "HIGH",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = createTaskSchema.safeParse({
      title:    "Task",
      priority: "EXTREME",
    });
    expect(result.success).toBe(false);
  });

  it("defaults priority to MEDIUM", () => {
    const result = createTaskSchema.safeParse({ title: "Task" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.priority).toBe("MEDIUM");
  });

  it("rejects title over 200 chars", () => {
    const result = createTaskSchema.safeParse({ title: "t".repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe("createPhaseSchema", () => {
  it("accepts a valid phase", () => {
    const result = createPhaseSchema.safeParse({ name: "Design" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createPhaseSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("createMilestoneSchema", () => {
  it("accepts a valid milestone with due date", () => {
    const result = createMilestoneSchema.safeParse({
      name:    "API complete",
      dueDate: "2025-03-31",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a milestone without due date", () => {
    const result = createMilestoneSchema.safeParse({ name: "Milestone" });
    expect(result.success).toBe(true);
  });
});

describe("createSprintSchema", () => {
  it("accepts a valid sprint", () => {
    const result = createSprintSchema.safeParse({
      name:      "Sprint 1",
      startDate: "2025-02-01",
      endDate:   "2025-02-14",
    });
    expect(result.success).toBe(true);
  });

  it("requires startDate and endDate", () => {
    const result = createSprintSchema.safeParse({ name: "Sprint 1" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createSprintSchema.safeParse({
      name:      "Sprint 1",
      startDate: "Feb 1",
      endDate:   "Feb 14",
    });
    expect(result.success).toBe(false);
  });
});
