// app/register/page.tsx — New user registration page
// Next.js 15: searchParams is a Promise

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            TF
          </div>
          <div>
            <p className="text-base font-semibold">TrackFlow</p>
            <p className="text-xs text-muted-foreground">Create your account</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card p-8 shadow-md">
          <h1 className="text-lg font-semibold mb-1">Get started</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Set up your workspace in seconds.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms note */}
        <p className="mt-4 text-center text-xs text-muted-foreground px-4">
          By creating an account you agree to our terms of service
          and privacy policy.
        </p>
      </div>
    </div>
  );
}
