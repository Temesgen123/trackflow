// app/api/phases/[id]/milestones/route.ts — GET | POST

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMilestonesByPhase, createMilestone } from "@/lib/services/milestone";
import { createMilestoneSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: phaseId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const milestones = await getMilestonesByPhase(phaseId);
    return NextResponse.json(ok(milestones));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch milestones"), { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: phaseId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = createMilestoneSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const milestone = await createMilestone(phaseId, parsed.data);
    return NextResponse.json(ok(milestone), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to create milestone"), { status: 500 });
  }
}
