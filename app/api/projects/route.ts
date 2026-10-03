// app/api/projects/route.ts — GET | POST

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createProject, getProjectsByOwner } from "@/lib/services/project";
import { createProjectSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const projects = await getProjectsByOwner(session.user.id);
    return NextResponse.json(ok(projects));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch projects"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      // Return first human-readable error message, not raw Zod array
      const firstError = parsed.error.errors[0];
      const msg = `${firstError.path.join(".")}: ${firstError.message}`;
      return NextResponse.json(err(msg), { status: 400 });
    }
    const project = await createProject(session.user.id, parsed.data);
    return NextResponse.json(ok(project), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to create project"), { status: 500 });
  }
}
