import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ListChecks, Clock, Tag, Wallet, ScanLine, Plus } from "lucide-react";
import { useAuth } from "@/lib/firebase-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AISLE SPY" },
      { name: "description", content: "Your smart shopping dashboard." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { profile } = useAuth();
  const budget = profile?.monthlyBudget;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-2xl font-bold tracking-tight text-secondary md:text-3xl">
          {profile?.firstName || "Shopper"} 👋
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="col-span-1 rounded-3xl border-border p-6 shadow-[var(--shadow-card)] md:col-span-2" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Monthly budget</p>
              <p className="mt-2 text-3xl font-bold">{budget ? `R ${budget.toLocaleString()}` : "Not set"}</p>
              <p className="mt-1 text-sm opacity-80">Track spending in real time while you shop.</p>
            </div>
            <Wallet size={36} className="opacity-80" />
          </div>
          <Button variant="secondary" className="mt-5 rounded-xl bg-white/15 text-primary-foreground hover:bg-white/25" asChild>
            <Link to="/profile">Update budget</Link>
          </Button>
        </Card>

        <Card className="rounded-3xl border-border p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Quick actions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-16 flex-col rounded-2xl">
              <Plus size={18} /><span className="text-xs">New list</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col rounded-2xl">
              <ScanLine size={18} /><span className="text-xs">Scan</span>
            </Button>
          </div>
        </Card>

        <DashCard to="/shopping-lists" icon={<ListChecks size={22} />} title="Shopping Lists" body="Plan before you go." />
        <DashCard to="/history" icon={<Clock size={22} />} title="History" body="See past trips & totals." />
        <DashCard to="/specials" icon={<Tag size={22} />} title="Specials" body="Deals from your stores." />
      </div>
    </div>
  );
}

function DashCard({ to, icon, title, body }: { to: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <Link to={to as any}>
      <Card className="group h-full rounded-3xl border-border p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
        <h3 className="text-base font-semibold text-secondary">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </Card>
    </Link>
  );
}