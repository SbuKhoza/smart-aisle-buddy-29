import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Trash2, Bell, MapPin, Shield, Moon, Languages } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { useAuth } from "@/lib/firebase-auth";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AISLE SPY" }, { name: "description", content: "Manage your AISLE SPY account and preferences." }] }),
  component: SettingsPage,
});

function Row({ icon, title, desc, right }: { icon: React.ReactNode; title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium leading-tight text-secondary">{title}</p>
          {desc && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { mode, isDark, setMode } = useTheme();
  const [notif, setNotif] = useState({ promos: true, drops: true, digest: false });
  const [loc, setLoc] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  async function onLogout() {
    await logout();
    navigate({ to: "/auth/login", replace: true });
  }

  async function onDelete() {
    try {
      const u = getFirebaseAuth().currentUser;
      if (u) await deleteUser(u);
      toast.success("Account deleted");
      navigate({ to: "/auth/register", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Please sign in again to delete your account");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 md:px-8">
      <h1 className="mb-4 text-[22px] font-bold tracking-tight text-secondary">Settings</h1>

      <Card className="gap-0 rounded-2xl border-border px-3 py-1 shadow-[var(--shadow-card)]">
        <p className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Appearance</p>
        <Row
          icon={<Moon size={15} />}
          title="Dark mode"
          desc={mode === "system" ? "Following your device setting" : isDark ? "On" : "Off"}
          right={<Switch checked={isDark} onCheckedChange={(v) => setMode(v ? "dark" : "light")} />}
        />
        <Row
          icon={<Languages size={15} />}
          title="Theme preference"
          right={
            <div className="flex rounded-full bg-accent p-0.5">
              {(["light", "dark", "system"] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                    mode === m ? "bg-card text-secondary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          }
        />
      </Card>

      <Card className="mt-3 gap-0 rounded-2xl border-border px-3 py-1 shadow-[var(--shadow-card)]">
        <p className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
        <Row icon={<Bell size={16} />} title="Promotions" desc="Weekly catalogue highlights" right={<Switch checked={notif.promos} onCheckedChange={(v) => setNotif({ ...notif, promos: v })} />} />
        <Row icon={<Bell size={16} />} title="Price drops" desc="When items on your lists get cheaper" right={<Switch checked={notif.drops} onCheckedChange={(v) => setNotif({ ...notif, drops: v })} />} />
        <Row icon={<Bell size={16} />} title="Weekly digest" right={<Switch checked={notif.digest} onCheckedChange={(v) => setNotif({ ...notif, digest: v })} />} />
      </Card>

      <Card className="mt-3 gap-0 rounded-2xl border-border px-3 py-1 shadow-[var(--shadow-card)]">
        <p className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">General</p>
        <Row icon={<MapPin size={16} />} title="Location" desc="Use my location for nearby stores" right={<Switch checked={loc} onCheckedChange={setLoc} />} />
        <Row icon={<Shield size={16} />} title="Analytics" desc="Help us improve AISLE SPY" right={<Switch checked={analytics} onCheckedChange={setAnalytics} />} />
        <Row icon={<Languages size={16} />} title="Language" desc="Coming soon" right={<span className="text-xs text-muted-foreground">English</span>} />
      </Card>

      <Card className="mt-3 gap-0 rounded-2xl border-border p-3 shadow-[var(--shadow-card)]">
        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
        <Button variant="outline" className="h-11 w-full justify-start rounded-xl text-[15px]" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-2 h-11 w-full justify-start rounded-xl text-[15px] text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>This is permanent. All your data will be removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}