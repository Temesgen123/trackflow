// vitest.setup.ts — global test setup
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation globally
vi.mock("next/navigation", () => ({
  useRouter:      () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname:    () => "/",
  useSearchParams:() => new URLSearchParams(),
  redirect:       vi.fn(),
  notFound:       vi.fn(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn:     vi.fn(),
  signOut:    vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch globally
global.fetch = vi.fn();
