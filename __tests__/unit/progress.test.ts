// __tests__/unit/progress.test.ts
import { describe, it, expect } from "vitest";
import {
  calcMilestoneProgress,
  calcPhaseProgress,
  calcProjectProgress,
} from "@/lib/utils/progress";

describe("calcMilestoneProgress", () => {
  it("returns 0 when no tasks", () => {
    expect(calcMilestoneProgress([])).toBe(0);
  });

  it("returns 100 when all tasks are done", () => {
    const tasks = [
      { status: "DONE" }, { status: "DONE" }, { status: "DONE" },
    ];
    expect(calcMilestoneProgress(tasks)).toBe(100);
  });

  it("returns 50 when half tasks are done", () => {
    const tasks = [{ status: "DONE" }, { status: "TODO" }];
    expect(calcMilestoneProgress(tasks)).toBe(50);
  });

  it("returns 0 when no tasks are done", () => {
    const tasks = [
      { status: "TODO" }, { status: "IN_PROGRESS" }, { status: "BLOCKED" },
    ];
    expect(calcMilestoneProgress(tasks)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    const tasks = [
      { status: "DONE" }, { status: "TODO" }, { status: "TODO" },
    ];
    expect(calcMilestoneProgress(tasks)).toBe(33);
  });
});

describe("calcPhaseProgress", () => {
  it("returns 0 when no milestones", () => {
    expect(calcPhaseProgress([])).toBe(0);
  });

  it("aggregates tasks across all milestones", () => {
    const milestones = [
      { tasks: [{ status: "DONE" }, { status: "DONE" }] },
      { tasks: [{ status: "TODO" }, { status: "TODO" }] },
    ];
    expect(calcPhaseProgress(milestones)).toBe(50);
  });

  it("returns 100 when all milestone tasks are done", () => {
    const milestones = [
      { tasks: [{ status: "DONE" }] },
      { tasks: [{ status: "DONE" }, { status: "DONE" }] },
    ];
    expect(calcPhaseProgress(milestones)).toBe(100);
  });
});

describe("calcProjectProgress", () => {
  it("returns 0 when no phases", () => {
    expect(calcProjectProgress([])).toBe(0);
  });

  it("counts only DONE phases", () => {
    const phases = [
      { status: "DONE" },
      { status: "IN_PROGRESS" },
      { status: "TODO" },
      { status: "DONE" },
    ];
    expect(calcProjectProgress(phases)).toBe(50);
  });

  it("returns 100 when all phases are done", () => {
    const phases = [{ status: "DONE" }, { status: "DONE" }];
    expect(calcProjectProgress(phases)).toBe(100);
  });

  it("returns 0 when no phases are done", () => {
    const phases = [{ status: "TODO" }, { status: "IN_PROGRESS" }];
    expect(calcProjectProgress(phases)).toBe(0);
  });
});
