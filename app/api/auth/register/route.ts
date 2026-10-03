// app/api/auth/register/route.ts — POST: create new user account

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ok, err } from "@/types";

const registerSchema = z.object({
  name:     z.string().min(1, "Name is required").max(100),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0].message;
      return NextResponse.json(err(msg), { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check if email already registered
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        err("An account with this email already exists"),
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(ok(user), { status: 201 });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json(err("Something went wrong"), { status: 500 });
  }
}
