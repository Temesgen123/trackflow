// __tests__/unit/api-projects.test.ts
// Tests the API route logic by mocking auth and db

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findMany: vi.fn(),
      create:   vi.fn(),
    },
  },
}));

// Mock services
vi.mock("@/lib/services/project", () => ({
  getProjectsByOwner: vi.fn(),
  createProject:      vi.fn(),
}));

import { GET, POST } from "@/app/api/projects/route";
import { auth } from "@/lib/auth";
import { getProjectsByOwner, createProject } from "@/lib/services/project";

const mockAuth         = vi.mocked(auth);
const mockGetProjects  = vi.mocked(getProjectsByOwner);
const mockCreateProject= vi.mocked(createProject);

describe("GET /api/projects", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns projects for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const mockProjects = [{ id: "p1", name: "Project 1" }];
    mockGetProjects.mockResolvedValue(mockProjects as any);

    const res  = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toEqual(mockProjects);
    expect(body.error).toBeNull();
  });
});

describe("POST /api/projects", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);
    const req = new NextRequest("http://localhost/api/projects", {
      method: "POST",
      body:   JSON.stringify({ name: "Test" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const req = new NextRequest("http://localhost/api/projects", {
      method: "POST",
      body:   JSON.stringify({ name: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res  = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it("creates a project and returns 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    const created = { id: "proj-1", name: "New Project", ownerId: "user-1" };
    mockCreateProject.mockResolvedValue(created as any);

    const req = new NextRequest("http://localhost/api/projects", {
      method: "POST",
      body:   JSON.stringify({ name: "New Project" }),
      headers: { "Content-Type": "application/json" },
    });
    const res  = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data).toEqual(created);
  });
});
