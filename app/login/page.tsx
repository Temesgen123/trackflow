// app/login/page.tsx — Auth.js v5 login with proper error handling

import { auth, signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

export const metadata = { title: 'Sign in' };

// Error messages mapped from Auth.js error codes
function getErrorMessage(error: string | undefined) {
  switch (error) {
    case 'CredentialsSignin':
      return 'Invalid email or password.';
    case 'CallbackRouteError':
      return 'Sign in failed. Please try again.';
    case 'AccessDenied':
      return 'Access denied.';
    default:
      return error ? 'Something went wrong. Please try again.' : null;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session) redirect('/dashboard');

  // Next.js 15: searchParams is a Promise
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-md">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            TF
          </div>
          <div>
            <p className="text-base font-semibold">TrackFlow</p>
            <p className="text-xs text-muted-foreground">
              Sign in to your workspace
            </p>
          </div>
        </div>

        {/* Error from redirect */}
        {errorMessage && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Sign-in form */}
        <form
          action={async (formData: FormData) => {
            'use server';
            try {
              await signIn('credentials', {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirectTo: '/dashboard',
              });
            } catch (error) {
              // Auth.js throws a NEXT_REDIRECT for successful sign-in — must re-throw it
              if (error instanceof AuthError) {
                const code = error.type ?? 'Default';
                redirect(`/login?error=${code}`);
              }
              // Re-throw redirect (successful login)
              throw error;
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
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

        {/* Demo hint */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Demo:&nbsp;
          <span className="font-mono">demo@trackflow.dev</span>
          &nbsp;/&nbsp;
          <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  );
}
