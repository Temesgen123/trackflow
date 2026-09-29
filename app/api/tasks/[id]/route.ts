// app/api/tasks/[id]/route.ts — PATCH | DELETE

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateTask, deleteTask } from "@/lib/services/task";
import { updateTaskSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const task = await updateTask(id, parsed.data);
    return NextResponse.json(ok(task));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to update task"), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    await deleteTask(id);
    return NextResponse.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to delete task"), { status: 500 });
  }
}
