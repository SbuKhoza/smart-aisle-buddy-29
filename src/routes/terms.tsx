import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service & Privacy — AISLE SPY" },
      { name: "description", content: "The terms and privacy policy that govern your use of the AISLE SPY smart shopping calculator." },
      { property: "og:title", content: "Terms of Service & Privacy — AISLE SPY" },
      { property: "og:description", content: "How AISLE SPY works, what you agree to, and how your shopping data is handled." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By creating an AISLE SPY account or using the app you agree to these Terms of Service and the Privacy notice below. If you do not agree, please do not use AISLE SPY.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "You must provide accurate details when registering and keep your password confidential. You are responsible for activity that happens under your account.",
      "Accounts are personal. Do not share your login with others or attempt to access another person's lists.",
    ],
  },
  {
    title: "3. Using the service",
    body: [
      "AISLE SPY is a shopping planning and budgeting calculator. Prices, specials and product listings are indicative only and may differ from in-store prices at the till.",
      "You may not misuse the service, attempt to break its security, scrape data at scale, or upload unlawful content.",
    ],
  },
  {
    title: "4. Your content",
    body: [
      "Your shopping lists, custom products, budgets and history belong to you. You grant AISLE SPY permission to store and process this data solely to operate the service for you.",
    ],
  },
  {
    title: "5. Privacy",
    body: [
      "We store your profile, lists and shopping history in order to provide totals, history and suggestions. Location is only used if you enable it in Settings.",
      "We do not sell your personal information. You can update your profile, adjust privacy settings, or request deletion of your account data at any time from Settings.",
    ],
  },
  {
    title: "6. Availability and offline use",
    body: [
      "AISLE SPY works offline and syncs when you reconnect. We cannot guarantee uninterrupted availability, and you should confirm important totals in-store.",
    ],
  },
  {
    title: "7. Limitation of liability",
    body: [
      "The service is provided \"as is\". AISLE SPY is not liable for pricing differences, missed specials, or any loss arising from reliance on estimated totals.",
    ],
  },
  {
    title: "8. Changes",
    body: [
      "We may update these terms as the app evolves. Continued use after an update means you accept the revised terms.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex justify-center"><BrandLogo /></div>

        <h1 className="text-2xl font-bold tracking-tight text-secondary">Terms of Service &amp; Privacy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Version 1.0 · Last updated 7 August 2026</p>

        <div className="mt-8 space-y-7">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-[15px] font-semibold text-secondary">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link to="/auth/register" className="font-semibold text-primary hover:underline">Back to sign up</Link>
        </p>
      </div>
    </div>
  );
}
