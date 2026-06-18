import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { joinWaitlist } from "@/lib/api";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  LayoutDashboard,
  Handshake,
  Package,
  Truck,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tureep AI+ — Private B2B Trade Network" },
      {
        name: "description",
        content:
          "The AI-powered trade network for institutional buyers and sellers across Iraq, Iran, Turkey, and global markets.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "$4.2B+", label: "Trade value screened" },
  { value: "12,800+", label: "Pre-deals generated" },
  { value: "1,400+", label: "Verified members" },
  { value: "24", label: "Active corridors" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Matchmaking",
    description: "Proprietary scoring across price, reputation, urgency, and logistics to surface the best counterparties.",
  },
  {
    icon: Shield,
    title: "Institutional Trust",
    description: "Verified companies, sanctions screening, and structured payment workflows on every deal.",
  },
  {
    icon: Truck,
    title: "Logistics Clearing",
    description: "Shipping quotes, customs-aware routing, and tracking consolidated inside the deal timeline.",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description: "Price signals, demand forecasting, and corridor analytics reserved for Master Account holders.",
  },
];

const tiers = [
  { name: "Bronze", price: "$100", note: "per month", highlight: false },
  { name: "Silver", price: "$300", note: "per month", highlight: false },
  { name: "Gold", price: "$1,000", note: "per month", highlight: true },
  { name: "Platinum", price: "$5,000", note: "per month", highlight: false },
  { name: "Black", price: "$20,000", note: "per month", highlight: false },
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
      setMessage("Your application has been received. Our team will review it shortly.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500/10">
              <span className="font-serif text-lg font-bold text-yellow-400">T</span>
            </div>
            <span className="font-serif text-xl font-medium tracking-wide text-white">
              Tureep <span className="text-yellow-400">AI+</span>
            </span>
          </a>
          <div className="hidden items-center gap-10 text-sm font-medium tracking-wide text-white/60 md:flex">
            <a href="#platform" className="hover:text-white">Platform</a>
            <a href="#tiers" className="hover:text-white">Membership</a>
            <a href="#corridors" className="hover:text-white">Corridors</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="hidden text-sm font-medium text-white/60 hover:text-white sm:block">
              Sign in
            </a>
            <a
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-5 py-2.5 text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500 hover:text-black"
            >
              Access Terminal
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black"></div>
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-yellow-500/5 blur-[120px]"></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-32">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-medium uppercase tracking-widest text-yellow-400">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
              Private member network
            </div>
            <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Trade at the speed of intelligence
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/50">
              Tureep AI+ connects verified sellers and buyers across the Middle East and beyond. 
              Our AI pre-generates institutional deals, clears compliance, and orchestrates logistics 
              — before the first message is sent.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Business email address"
                disabled={status === "loading"}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-yellow-500/50 focus:bg-white/10 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-500 px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-50"
              >
                {status === "loading" ? "Applying..." : "Request access"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {status === "success" && (
              <p className="mt-4 text-sm font-medium text-yellow-400">{message}</p>
            )}
            {status === "error" && <p className="mt-4 text-sm font-medium text-red-400">{message}</p>}
            <p className="mt-4 text-xs text-white/30">
              Membership is reviewed. Priority given to commodity traders, manufacturers, and logistics operators.
            </p>
          </div>

          {/* Product UI mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-yellow-500/10 blur-2xl"></div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs font-medium text-white/40">Tureep AI+ Terminal</div>
              </div>
              <div className="flex">
                <div className="w-14 border-r border-white/10 py-4">
                  <div className="mx-auto mb-3 h-8 w-8 rounded-lg bg-yellow-500/10"></div>
                  <div className="mx-auto mb-3 h-8 w-8 rounded-lg bg-white/5"></div>
                  <div className="mx-auto mb-3 h-8 w-8 rounded-lg bg-white/5"></div>
                </div>
                <div className="flex-1 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-xs font-medium text-white/40">Dashboard</div>
                    <div className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">Gold Member</div>
                  </div>
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/40">Active Pre-Deals</div>
                      <div className="mt-1 text-xl font-semibold text-white">12</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/40">Trade Value</div>
                      <div className="mt-1 text-xl font-semibold text-white">$2.4M</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/40">Match Score</div>
                      <div className="mt-1 text-xl font-semibold text-yellow-400">94</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Premium Iraqi Dates</div>
                      <div className="text-xs text-yellow-400">Recommended</div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                      <span>300 ton</span>
                      <span>$2.65 / ton</span>
                      <span>Escrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-neutral-950">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="py-10 text-center sm:px-4">
              <p className="font-serif text-3xl font-medium text-white sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-widest text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform features */}
      <section id="platform" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-yellow-400">The Platform</p>
            <h2 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl">
              Built for the full deal cycle
            </h2>
            <p className="mt-4 text-lg text-white/40">
              From discovery to settlement, every step is engineered for institutional trust and velocity.
            </p>
          </div>
          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group bg-black p-8 transition-colors hover:bg-neutral-950">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/40">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master tiers */}
      <section id="tiers" className="border-y border-white/10 bg-neutral-950 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-yellow-400">Membership</p>
            <h2 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl">
              Master Accounts
            </h2>
            <p className="mt-4 text-lg text-white/40">
              Tiered access designed for every scale of international trade.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl border p-6 transition-all hover:border-yellow-500/50 ${
                  t.highlight
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-white/10 bg-black hover:bg-neutral-950"
                }`}
              >
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-black">
                    Most popular
                  </div>
                )}
                <p className="text-sm font-medium uppercase tracking-widest text-white/40">{t.name}</p>
                <p className="mt-4 font-serif text-3xl font-medium text-white">{t.price}</p>
                <p className="text-xs text-white/30">{t.note}</p>
                <ul className="mt-6 space-y-3 text-sm text-white/50">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500/70" />
                    Priority deal access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500/70" />
                    Reduced commission
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500/70" />
                    Dedicated support
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corridors */}
      <section id="corridors" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-yellow-400">Corridors</p>
            <h2 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl">
              Active trade lanes
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { from: "Iraq", to: "Turkey", goods: "Dates, Phosphate, Marble", icon: LayoutDashboard },
              { from: "Iran", to: "Turkey", goods: "Steel Scrap, Petrochemicals", icon: Handshake },
              { from: "Turkey", to: "Global", goods: "Processed commodities, Textiles", icon: Globe },
            ].map((c) => (
              <div key={c.from} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-white">{c.from}</span>
                  <ArrowRight className="h-4 w-4 text-yellow-500/70" />
                  <span className="text-lg font-medium text-white">{c.to}</span>
                </div>
                <p className="mt-4 text-sm text-white/40">{c.goods}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-white/10 bg-neutral-950 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-4xl font-medium text-white sm:text-5xl">
            Join the private network
          </h2>
          <p className="mt-4 text-lg text-white/40">
            Priority access is limited. Apply today and our team will review your membership.
          </p>
          <a
            href="/login"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-yellow-400"
          >
            Access Terminal
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500/10">
                <span className="font-serif text-lg font-bold text-yellow-400">T</span>
              </div>
              <span className="font-serif text-xl font-medium tracking-wide text-white">
                Tureep <span className="text-yellow-400">AI+</span>
              </span>
            </a>
            <p className="text-sm text-white/30">
              © 2026 Tureep Logistics Systems. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm font-medium text-white/40">
              <a href="/login" className="hover:text-white">Sign in</a>
              <a href="/dashboard" className="hover:text-white">Dashboard</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
