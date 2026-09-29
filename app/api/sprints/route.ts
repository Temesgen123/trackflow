// app/api/sprints/route.ts — GET | POST

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSprintSchema } from "@/lib/validations/schemas";
import { ok, err } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json(err("projectId required"), { status: 400 });
  try {
    const sprints = await db.sprint.findMany({
      where: { projectId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(ok(sprints));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch sprints"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });
  try {
    const body = await req.json();
    const parsed = createSprintSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(err(parsed.error.message), { status: 400 });
    const { projectId, ...data } = body;
    const sprint = await db.sprint.create({
      data: {
        projectId,
        name: data.name,
        goal: data.goal,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
    return NextResponse.json(ok(sprint), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to create sprint"), { status: 500 });
  }
}
