import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Trash2, Bell, MapPin, Shield, Palette, Languages } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { useAuth } from "@/lib/firebase-auth";
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
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-sm font-medium text-secondary">{title}</p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-secondary">Settings</h1>

      <Card className="rounded-3xl border-border p-4 shadow-[var(--shadow-card)]">
        <p className="mb-2 px-1 text-xs uppercase tracking-widest text-muted-foreground">Notifications</p>
        <Row icon={<Bell size={16} />} title="Promotions" desc="Weekly catalogue highlights" right={<Switch checked={notif.promos} onCheckedChange={(v) => setNotif({ ...notif, promos: v })} />} />
        <Row icon={<Bell size={16} />} title="Price drops" desc="When items on your lists get cheaper" right={<Switch checked={notif.drops} onCheckedChange={(v) => setNotif({ ...notif, drops: v })} />} />
        <Row icon={<Bell size={16} />} title="Weekly digest" right={<Switch checked={notif.digest} onCheckedChange={(v) => setNotif({ ...notif, digest: v })} />} />
      </Card>

      <Card className="mt-4 rounded-3xl border-border p-4 shadow-[var(--shadow-card)]">
        <p className="mb-2 px-1 text-xs uppercase tracking-widest text-muted-foreground">General</p>
        <Row icon={<MapPin size={16} />} title="Location" desc="Use my location for nearby stores" right={<Switch checked={loc} onCheckedChange={setLoc} />} />
        <Row icon={<Shield size={16} />} title="Analytics" desc="Help us improve AISLE SPY" right={<Switch checked={analytics} onCheckedChange={setAnalytics} />} />
        <Row icon={<Palette size={16} />} title="Theme" desc="Coming soon" right={<span className="text-xs text-muted-foreground">System</span>} />
        <Row icon={<Languages size={16} />} title="Language" desc="Coming soon" right={<span className="text-xs text-muted-foreground">English</span>} />
      </Card>

      <Card className="mt-4 rounded-3xl border-border p-4 shadow-[var(--shadow-card)]">
        <p className="mb-2 px-1 text-xs uppercase tracking-widest text-muted-foreground">Account</p>
        <Button variant="outline" className="mt-1 h-12 w-full justify-start rounded-2xl" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-2 h-12 w-full justify-start rounded-2xl text-destructive hover:text-destructive">
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