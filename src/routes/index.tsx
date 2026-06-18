import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroMap from "@/assets/hero-map.jpg";
import catDates from "@/assets/cat-dates.jpg";
import catSteel from "@/assets/cat-steel.jpg";
import catPhosphate from "@/assets/cat-phosphate.jpg";
import { joinWaitlist } from "@/lib/api";
import {
  ArrowRight,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Truck,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tureep AI+ — B2B Trade Intelligence" },
      {
        name: "description",
        content:
          "AI-powered B2B trade platform connecting sellers in Iraq and Iran to buyers in Turkey and global markets. Institutional pre-deals, brokered in milliseconds.",
      },
      { property: "og:title", content: "Tureep AI+ — B2B Trade Intelligence" },
      {
        property: "og:description",
        content:
          "AI-powered B2B trade platform connecting sellers in Iraq and Iran to buyers in Turkey and global markets.",
      },
      { property: "og:image", content: heroMap },
      { name: "twitter:image", content: heroMap },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Pre-deals generated", value: "12,800+" },
  { label: "Trade value facilitated", value: "$4.2B" },
  { label: "Verified companies", value: "1,400+" },
  { label: "Corridors active", value: "24" },
];

const features = [
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description:
      "Our engine analyzes price, location, reputation, and urgency to generate high-confidence pre-deals automatically.",
  },
  {
    icon: Shield,
    title: "Compliance First",
    description:
      "Built-in sanctions screening, trade agreement checks, and verified counterparties for every transaction.",
  },
  {
    icon: Truck,
    title: "Integrated Logistics",
    description:
      "Shipping quotes, tracking, and documentation in one place. Road, sea, and air freight supported.",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description:
      "Real-time price signals, demand forecasting, and corridor analytics to inform every decision.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "From Iraq and Iran to Turkey, Europe, Africa, and Asia. Multi-currency and multi-language ready.",
  },
  {
    icon: CheckCircle2,
    title: "Secure Settlement",
    description:
      "Escrow, L/C, and D/P workflows with integrated payment tracking and dispute resolution.",
  },
];

const tiers = [
  { name: "Free", price: "$0", description: "Explore the platform and basic deal flow." },
  { name: "Bronze", price: "$100/mo", description: "Priority listing and reduced notifications." },
  { name: "Silver", price: "$300/mo", description: "Featured badge and 12h early access." },
  { name: "Gold", price: "$1,000/mo", description: "Exclusive deals, auctions, and analytics." },
  { name: "Platinum", price: "$5,000/mo", description: "Dedicated manager and custom insights." },
  { name: "Black", price: "$20,000/mo", description: "White-glove service and instant execution." },
];

const commodities = [
  {
    img: catDates,
    category: "Agricultural",
    name: "Premium Dates",
    description: "Direct sourcing from Basra and Ahvaz farms. Verified grades and moisture tracking.",
  },
  {
    img: catSteel,
    category: "Industrial",
    name: "Steel Scrap",
    description: "Aggregated HMS 1/2 scrap routes with real-time weight verification.",
  },
  {
    img: catPhosphate,
    category: "Chemical",
    name: "Phosphate",
    description: "High-purity phosphate rock from Iraqi basins. Direct-to-port automation.",
  },
];

export default function Index() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      await joinWaitlist(email);
      setStatus("success");
      setMessage("Thank you. You're on the Tureep AI+ waitlist.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="font-mono text-sm font-bold">T</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Tureep AI+</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Platform</a>
            <a href="#tiers" className="hover:text-foreground">Master Accounts</a>
            <a href="#commodities" className="hover:text-foreground">Commodities</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              Sign in
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Access Terminal
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Now live for Iraq → Turkey corridors
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              AI-powered trade infrastructure for the Middle East
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Connect sellers in Iraq and Iran with buyers in Turkey and global markets. Our AI engine
              generates pre-deals, verifies compliance, and clears logistics — in milliseconds.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your business email"
                disabled={status === "loading"}
                className="flex-1 rounded-md border border-input bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {status === "loading" ? "Joining..." : "Join waitlist"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {status === "success" && (
              <p className="mt-3 text-sm font-medium text-green-600">{message}</p>
            )}
            {status === "error" && <p className="mt-3 text-sm font-medium text-red-600">{message}</p>}
            <p className="mt-4 text-xs text-muted-foreground">
              Trusted by commodity traders, manufacturers, and logistics providers across 24 corridors.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
            <div className="absolute -bottom-4 -right-4 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"></div>
            <img
              src={heroMap}
              alt="Trade corridors across Basra, Tehran, and Istanbul"
              className="relative rounded-xl border border-border shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl divide-y divide-border px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="py-8 text-center sm:px-4">
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One platform for the full trade cycle
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From discovery and matching to settlement and tracking, Tureep AI+ handles the complexity
              so you can focus on the deal.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="border-y border-border bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Master Accounts
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tiered access designed for every scale of trade. Higher tiers unlock priority, exclusivity,
              and lower fees.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-medium text-primary">{t.name}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{t.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commodities */}
      <section id="commodities" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Active commodity corridors
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start with high-volume corridors and expand into new markets and categories.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {commodities.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <img
                  src={c.img}
                  alt={c.name}
                  className="h-56 w-full object-cover"
                />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{c.category}</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-primary py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to trade smarter?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join the platform that turns commodity data into closed deals. Priority access for founding
            members.
          </p>
          <a
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-blue-50"
          >
            Access Terminal
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="font-mono text-sm font-bold">T</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Tureep AI+</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Tureep Logistics Systems. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <a href="/login" className="hover:text-foreground">Sign in</a>
              <a href="/dashboard" className="hover:text-foreground">Dashboard</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
