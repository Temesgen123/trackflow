// middleware.ts — Auth guard for all protected routes
// Next.js 15 + Auth.js v5

export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    // Protect everything except auth pages, API auth, and static assets
    "/((?!login|register|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
