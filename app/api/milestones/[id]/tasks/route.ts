// app/api/milestones/[id]/tasks/route.ts — GET | POST

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTasksByMilestone, createTask } from "@/lib/services/task";
import { createTaskSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: milestoneId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const tasks = await getTasksByMilestone(milestoneId);
    return NextResponse.json(ok(tasks));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch tasks"), { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: milestoneId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const task = await createTask(milestoneId, parsed.data);
    return NextResponse.json(ok(task), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to create task"), { status: 500 });
  }
}
