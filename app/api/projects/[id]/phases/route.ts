// app/api/projects/[id]/phases/route.ts — GET | POST
// Next.js 15: params awaited as Promise

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPhasesByProject, createPhase } from "@/lib/services/phase";
import { createPhaseSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const phases = await getPhasesByProject(projectId);
    return NextResponse.json(ok(phases));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch phases"), { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = createPhaseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const phase = await createPhase(projectId, parsed.data);
    return NextResponse.json(ok(phase), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to create phase"), { status: 500 });
  }
}
