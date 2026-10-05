// app/settings/page.tsx — Settings / profile page

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { AccountInfo } from "@/components/settings/account-info";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, createdAt: true,
      passwordHash: true,
      _count: { select: { ownedProjects: true, assignedTasks: true } },
    },
  });
  if (!user) redirect("/login");

  const hasPassword = !!user.passwordHash;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile and account preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account info card */}
          <AccountInfo
            name={user.name}
            email={user.email}
            createdAt={user.createdAt.toISOString()}
            projectCount={user._count.ownedProjects}
            taskCount={user._count.assignedTasks}
          />

          {/* Profile form */}
          <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">Profile</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your name and email address
              </p>
            </div>
            <div className="p-6">
              <ProfileForm name={user.name} email={user.email} />
            </div>
          </section>

          {/* Password form — only for credential accounts */}
          {hasPassword && (
            <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/30">
                <h2 className="text-sm font-semibold">Change password</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose a strong password of at least 8 characters
                </p>
              </div>
              <div className="p-6">
                <PasswordForm />
              </div>
            </section>
          )}

          {/* Danger zone — account deletion placeholder */}
          <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="text-sm font-semibold text-destructive mb-1">Danger zone</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Account deletion is permanent. All your projects, phases, milestones and tasks will be removed.
            </p>
            <button
              disabled
              title="Contact support to delete your account"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive opacity-50 cursor-not-allowed"
            >
              Delete account
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Contact support to request account deletion.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
