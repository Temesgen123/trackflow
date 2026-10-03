// components/settings/account-info.tsx
import { format } from "date-fns";
import { User, Calendar, FolderKanban, CheckSquare } from "lucide-react";

interface AccountInfoProps {
  name: string;
  email: string;
  createdAt: string;
  projectCount: number;
  taskCount: number;
}

export function AccountInfo({
  name, email, createdAt, projectCount, taskCount,
}: AccountInfoProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b bg-muted/30">
        <h2 className="text-sm font-semibold">Account</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Your account overview</p>
      </div>
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-lg font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Joined {format(new Date(createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderKanban className="h-3.5 w-3.5" />
                {projectCount} project{projectCount !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckSquare className="h-3.5 w-3.5" />
                {taskCount} task{taskCount !== 1 ? "s" : ""} assigned
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
