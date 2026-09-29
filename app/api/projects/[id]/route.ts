// app/api/projects/[id]/route.ts — GET | PATCH | DELETE
// Next.js 15: params is now a Promise — must be awaited

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectById, updateProject, deleteProject } from "@/lib/services/project";
import { updateProjectSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(err("Unauthorized"), { status: 401 });
  }
  try {
    const project = await getProjectById(id, session.user.id);
    if (!project) return NextResponse.json(err("Not found"), { status: 404 });
    return NextResponse.json(ok(project));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch project"), { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(err("Unauthorized"), { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(err(parsed.error.message), { status: 400 });
    }
    await updateProject(id, session.user.id, parsed.data);
    return NextResponse.json(ok({ updated: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to update project"), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(err("Unauthorized"), { status: 401 });
  }
  try {
    await deleteProject(id, session.user.id);
    return NextResponse.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to delete project"), { status: 500 });
  }
}
