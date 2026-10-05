// components/layout/sidebar.tsx — Responsive sidebar with hamburger menu
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, Kanban,
  Flag, ListTodo, BarChart2, Settings, LogOut, X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Projects",     href: "/projects",   icon: FolderKanban    },
  { label: "Sprint Board", href: "/board",      icon: Kanban          },
  { label: "Backlog",      href: "/backlog",    icon: ListTodo        },
  { label: "Milestones",   href: "/milestones", icon: Flag            },
];

const BOTTOM_NAV = [
  { label: "Reports",  href: "/reports",  icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const path = usePathname();

  // Close on route change (mobile)
  useEffect(() => { onClose(); }, [path]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLink = (href: string, label: string, Icon: React.ElementType) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition-colors",
        path.startsWith(href)
          ? "bg-slate-800 text-white"
          : "hover:bg-slate-800 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base styles
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 px-3 py-5 text-slate-300 transition-transform duration-300 ease-in-out",
          // Desktop: always visible, static
          "lg:static lg:z-auto lg:w-56 lg:translate-x-0 lg:transition-none",
          // Mobile: slide in/out
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand + close button */}
        <div className="mb-6 flex items-center justify-between px-2 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shrink-0">
              TF
            </div>
            <span className="text-sm font-semibold text-white">TrackFlow</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Workspace
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ label, href, icon: Icon }) => navLink(href, label, Icon))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Tools
          </p>
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => navLink(href, label, Icon))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
