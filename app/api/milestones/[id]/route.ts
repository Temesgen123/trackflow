// app/api/milestones/[id]/route.ts — PATCH | DELETE

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateMilestone, deleteMilestone } from "@/lib/services/milestone";
import { updateMilestoneSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = updateMilestoneSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const milestone = await updateMilestone(id, parsed.data);
    return NextResponse.json(ok(milestone));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to update milestone"), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    await deleteMilestone(id);
    return NextResponse.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to delete milestone"), { status: 500 });
  }
}
