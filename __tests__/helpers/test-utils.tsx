// __tests__/helpers/test-utils.tsx — Shared test utilities

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/toast";

// Custom render that wraps components in ToastProvider
function AllProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };

// Mock fetch helper — returns a successful JSON response
export function mockFetchSuccess(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok:   true,
    json: async () => ({ data, error: null }),
  });
}

// Mock fetch helper — returns an error JSON response
export function mockFetchError(error: string, status = 400) {
  return vi.fn().mockResolvedValue({
    ok:     false,
    status,
    json:   async () => ({ data: null, error }),
  });
}

// Build a minimal task object for tests
export function makeTask(overrides = {}) {
  return {
    id:          "task-1",
    title:       "Test task",
    description: null,
    status:      "TODO",
    priority:    "MEDIUM",
    dueDate:     null,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    assignee:    null,
    sprint:      null,
    milestone:   null,
    ...overrides,
  };
}

// Build a minimal project object for tests
export function makeProject(overrides = {}) {
  return {
    id:          "proj-1",
    name:        "Test Project",
    description: null,
    status:      "ACTIVE",
    startDate:   null,
    endDate:     null,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    ownerId:     "user-1",
    phases:      [],
    sprints:     [],
    ...overrides,
  };
}
