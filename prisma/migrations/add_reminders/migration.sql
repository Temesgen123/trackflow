-- Migration: add_reminders
-- Run this against your database if you are NOT using prisma migrate dev

CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'DONE');

CREATE TABLE "reminders" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"    TEXT NOT NULL,
  "text"       TEXT NOT NULL,
  "status"     "ReminderStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "reminders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reminders_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "reminders_user_id_idx" ON "reminders"("user_id");
