// app/api/auth/[...nextauth]/route.ts
// Next.js 15: Route Handler for Auth.js v5

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
