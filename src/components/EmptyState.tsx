import type { ReactNode } from "react";

export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0" fill="none">
          <circle cx="40" cy="40" r="38" fill="var(--primary-soft)" />
        </svg>
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-semibold text-secondary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}