// app/api/reminders/route.ts — GET list | POST create

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ok, err } from "@/types";

const createSchema = z.object({
  text: z.string().min(1, "Reminder text is required").max(500),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });

  try {
    const reminders = await db.reminder.findMany({
      where:   { userId: session.user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(ok(reminders));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to fetch reminders"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });

  try {
    const body   = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(err(parsed.error.errors[0].message), { status: 400 });
    }
    const reminder = await db.reminder.create({
      data: { userId: session.user.id, text: parsed.data.text },
    });
    return NextResponse.json(ok(reminder), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Failed to create reminder"), { status: 500 });
  }
}
