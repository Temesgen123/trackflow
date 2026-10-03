// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Flag,
  ListTodo,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects",     href: "/projects",  icon: FolderKanban    },
  { label: "Sprint Board", href: "/board",     icon: Kanban          },
  { label: "Backlog",      href: "/backlog",   icon: ListTodo        },
  { label: "Milestones",   href: "/milestones",icon: Flag            },
];

const BOTTOM_NAV = [
  { label: "Reports",  href: "/reports",  icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings  },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col bg-slate-900 px-3 py-5 text-slate-300 shrink-0">
      <div className="mb-6 flex items-center gap-2.5 px-2 pb-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          TF
        </div>
        <span className="text-sm font-semibold text-white">TrackFlow</span>
      </div>

      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        Workspace
      </p>
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
              path.startsWith(href)
                ? "bg-slate-800 text-white"
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Tools
        </p>
        {BOTTOM_NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
              path.startsWith(href)
                ? "bg-slate-800 text-white"
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-2 flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
