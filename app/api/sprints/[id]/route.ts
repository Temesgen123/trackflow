// app/api/sprints/[id]/route.ts — PATCH | DELETE

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSprintSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = updateSprintSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const sprint = await db.sprint.update({ where: { id }, data: parsed.data });
    return NextResponse.json(ok(sprint));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to update sprint"), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    await db.sprint.delete({ where: { id } });
    return NextResponse.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to delete sprint"), { status: 500 });
  }
}
