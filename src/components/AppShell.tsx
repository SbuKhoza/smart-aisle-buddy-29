import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  ListChecks,
  Clock,
  Tag,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/shopping-lists", label: "Lists", icon: ListChecks },
  { to: "/history", label: "History", icon: Clock },
  { to: "/specials", label: "Specials", icon: Tag },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card px-3 py-5 md:flex md:flex-col">
        <div className="mb-6 px-2">
          <BrandLogo />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
            pathname.startsWith("/profile")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <UserIcon size={17} />
          Profile
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/85 px-4 py-2 backdrop-blur-xl md:hidden">
          <BrandLogo size={28} />
          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-secondary active:opacity-70"
          >
            <UserIcon size={16} />
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex min-w-[56px] flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors active:opacity-60",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={19} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}