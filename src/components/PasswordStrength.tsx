import { Check, X } from "lucide-react";
import { PASSWORD_RULES, passwordScore } from "@/lib/password";
import { cn } from "@/lib/utils";

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = passwordScore(value);
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < score ? (score < 3 ? "bg-destructive" : score < 5 ? "bg-muted-foreground" : "bg-primary") : "bg-border",
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(value);
          return (
            <li key={r.label} className={cn("flex items-center gap-1 text-[11px]", ok ? "text-primary" : "text-muted-foreground")}>
              {ok ? <Check size={12} /> : <X size={12} />} {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
