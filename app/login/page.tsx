// app/login/page.tsx — Credentials sign-in with link to register

import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import Link from "next/link";

export const metadata = { title: "Sign in" };

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case "CredentialsSignin":  return "Invalid email or password.";
    case "CallbackRouteError": return "Sign in failed. Please try again.";
    case "AccessDenied":       return "Access denied.";
    default: return error ? "Something went wrong. Please try again." : null;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const { error, registered } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            TF
          </div>
          <div>
            <p className="text-base font-semibold">TrackFlow</p>
            <p className="text-xs text-muted-foreground">Sign in to your workspace</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-md">

          {/* Registration success banner */}
          {registered && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✓ Account created! Sign in to get started.
            </div>
          )}

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <h1 className="text-lg font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to your account to continue.
          </p>

          {/* Sign-in form */}
          <form
            action={async (formData: FormData) => {
              "use server";
              try {
                await signIn("credentials", {
                  email:      formData.get("email") as string,
                  password:   formData.get("password") as string,
                  redirectTo: "/dashboard",
                });
              } catch (error) {
                if (error instanceof AuthError) {
                  const code = error.type ?? "Default";
                  redirect(`/login?error=${code}`);
                }
                throw error;
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" required
                autoComplete="email" placeholder="you@example.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" required
                autoComplete="current-password" placeholder="••••••••"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link
            href="/register"
            className="mt-4 block w-full rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            Create a new account
          </Link>

          {/* Demo hint */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Demo:&nbsp;
            <span className="font-mono">demo@trackflow.dev</span>
            &nbsp;/&nbsp;
            <span className="font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
