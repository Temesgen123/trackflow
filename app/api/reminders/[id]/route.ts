// app/api/reminders/[id]/route.ts — PATCH update | DELETE remove

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ok, err } from "@/types";

const updateSchema = z.object({
  text:   z.string().min(1).max(500).optional(),
  status: z.enum(["PENDING", "DONE"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });

  try {
    const body   = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(err(parsed.error.errors[0].message), { status: 400 });
    }
    const reminder = await db.reminder.updateMany({
      where: { id, userId: session.user.id },
      data:  parsed.data,
    });
    if (reminder.count === 0) return NextResponse.json(err("Not found"), { status: 404 });
    return NextResponse.json(ok({ updated: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to update reminder"), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });

  try {
    await db.reminder.deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to delete reminder"), { status: 500 });
  }
}
