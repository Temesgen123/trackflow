// app/api/user/route.ts — GET profile | PATCH update profile | PATCH change password

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ok, err } from "@/types";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) return NextResponse.json(err("User not found"), { status: 404 });
  return NextResponse.json(ok(user));
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json(err("Unauthorized"), { status: 401 });

  try {
    const body = await req.json();

    // Change password flow
    if (body.currentPassword !== undefined) {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(err(parsed.error.errors[0].message), { status: 400 });
      }
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user?.passwordHash) {
        return NextResponse.json(err("No password set on this account"), { status: 400 });
      }
      const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json(err("Current password is incorrect"), { status: 400 });

      const hash = await bcrypt.hash(parsed.data.newPassword, 12);
      await db.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } });
      return NextResponse.json(ok({ updated: "password" }));
    }

    // Update profile flow
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(err(parsed.error.errors[0].message), { status: 400 });
    }
    // Check email uniqueness
    const existing = await db.user.findFirst({
      where: { email: parsed.data.email, NOT: { id: session.user.id } },
    });
    if (existing) return NextResponse.json(err("Email already in use"), { status: 409 });

    const user = await db.user.update({
      where: { id: session.user.id },
      data:  { name: parsed.data.name, email: parsed.data.email },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(ok(user));
  } catch (e) {
    console.error(e);
    return NextResponse.json(err("Something went wrong"), { status: 500 });
  }
}
