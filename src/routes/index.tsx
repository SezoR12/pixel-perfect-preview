import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { joinWaitlist } from "@/lib/api";
import { useI18n, Language } from "@/lib/i18n";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Sparkles,
  TrendingUp,
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

export default function Index() {
  const { language, setLanguage, t, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const stats = [
    { value: "$4.2B+", label: t("Trade value screened", "Trade value screened") },
    { value: "12,800+", label: t("Pre-deals generated", "Pre-deals generated") },
    { value: "1,400+", label: t("Verified members", "Verified members") },
    { value: "24", label: t("Active corridors", "Active corridors") },
  ];

  const features = [
    {
      icon: Sparkles,
      title: t("AI Matchmaking", "AI Matchmaking"),
      description: t(
        "Proprietary scoring across price, reputation, urgency, and logistics to surface the best counterparties.",
        "Proprietary scoring across price, reputation, urgency, and logistics to surface the best counterparties."
      ),
    },
    {
      icon: Shield,
      title: t("Institutional Trust", "Institutional Trust"),
      description: t(
        "Verified companies, sanctions screening, and structured payment workflows on every deal.",
        "Verified companies, sanctions screening, and structured payment workflows on every deal."
      ),
    },
    {
      icon: Truck,
      title: t("Logistics Clearing", "Logistics Clearing"),
      description: t(
        "Shipping quotes, customs-aware routing, and tracking consolidated inside the deal timeline.",
        "Shipping quotes, customs-aware routing, and tracking consolidated inside the deal timeline."
      ),
    },
    {
      icon: TrendingUp,
      title: t("Market Intelligence", "Market Intelligence"),
      description: t(
        "Price signals, demand forecasting, and corridor analytics reserved for Master Account holders.",
        "Price signals, demand forecasting, and corridor analytics reserved for Master Account holders."
      ),
    },
  ];

  const tiers = [
    { name: "Bronze", price: "$100", note: t("per month", "per month"), highlight: false },
    { name: "Silver", price: "$300", note: t("per month", "per month"), highlight: false },
    { name: "Gold", price: "$1,000", note: t("per month", "per month"), highlight: true },
    { name: "Platinum", price: "$5,000", note: t("per month", "per month"), highlight: false },
    { name: "Black", price: "$20,000", note: t("per month", "per month"), highlight: false },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      await joinWaitlist(email);
      setStatus("success");
      setMessage(t("Your application has been received. Our team will review it shortly.", "Your application has been received. Our team will review it shortly."));
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(t("Something went wrong. Please try again.", "Something went wrong. Please try again."));
    }
  }

  return (
    <div className={`min-h-screen bg-black text-white ${dir === "rtl" ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md select-none">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500/10">
              <span className="font-serif text-lg font-bold text-yellow-400">T</span>
            </div>
            <span className="font-serif text-xl font-medium tracking-wide text-white">
              Tureep <span className="text-yellow-400">AI+</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium tracking-wide text-white/60 md:flex">
            <a href="#platform" className="hover:text-white">{t("nav.platform", "Platform")}</a>
            <a href="#tiers" className="hover:text-white">{t("nav.membership", "Membership")}</a>
            <a href="#corridors" className="hover:text-white">{t("nav.corridors", "Corridors")}</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher in top nav */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <Globe className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-yellow-400 cursor-pointer focus:outline-none"
              >
                <option value="en" className="bg-neutral-900 text-white">English (LTR)</option>
                <option value="ar" className="bg-neutral-900 text-white">العربية (RTL)</option>
                <option value="tr" className="bg-neutral-900 text-white">Türkçe (LTR)</option>
                <option value="ku" className="bg-neutral-900 text-white">کوردی (RTL)</option>
                <option value="fa" className="bg-neutral-900 text-white">فارسی (RTL)</option>
              </select>
            </div>

            <Link to="/login" className="hidden text-sm font-medium text-white/60 hover:text-white sm:block">
              {t("nav.signin", "Sign in")}
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-5 py-2 text-xs sm:text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500 hover:text-black"
            >
              <span>{t("nav.access", "Access Terminal")}</span>
              <ChevronRight className={dir === "rtl" ? "h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" : "h-4 w-4 transition-transform group-hover:translate-x-0.5"} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 select-text">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black"></div>
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-yellow-500/5 blur-[120px]"></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-32">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-medium uppercase tracking-widest text-yellow-400 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
              <span>{t("hero.tag", "Private member network")}</span>
            </div>
            <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {t("hero.title", "Trade at the speed of intelligence")}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/50">
              {t("hero.subtitle", "Tureep AI+ connects verified sellers and buyers across the Middle East and beyond. Our AI pre-generates institutional deals, clears compliance, and orchestrates logistics — before the first message is sent.")}
            </p>

            <form onSubmit={handleSubmit} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("hero.input", "Business email address")}
                disabled={status === "loading"}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-yellow-500/50 focus:bg-white/10 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-500 px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-50 select-none"
              >
                <span>{status === "loading" ? t("Applying...", "Applying...") : t("hero.req", "Request access")}</span>
                <ArrowRight className={dir === "rtl" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
              </button>
            </form>
            {status === "success" && (
              <p className="mt-4 text-sm font-medium text-yellow-400">{message}</p>
            )}
            {status === "error" && <p className="mt-4 text-sm font-medium text-red-400">{message}</p>}
            <p className="mt-4 text-xs text-white/30 leading-relaxed">
              {t("hero.disclaimer", "Membership is reviewed. Priority given to commodity traders, manufacturers, and logistics operators.")}
            </p>
          </div>

          {/* Terminal Mockup preview */}
          <div className="relative select-none">
            <div className="absolute -inset-4 rounded-3xl bg-yellow-500/10 blur-2xl"></div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                <div className="mx-4 text-xs font-medium text-white/40">{t("mock.head", "Tureep AI+ Terminal")}</div>
              </div>
              <div className="flex">
                <div className="w-14 border-x border-white/10 py-4 bg-neutral-950 flex flex-col items-center">
                  <div className="mb-3 h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold">T</div>
                  <div className="mb-3 h-8 w-8 rounded-lg bg-white/5"></div>
                  <div className="mb-3 h-8 w-8 rounded-lg bg-white/5"></div>
                </div>
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider">{t("mock.dash", "Dashboard")}</div>
                    <div className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">{t("mock.role", "Gold Member")}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[10px] text-white/40 uppercase font-mono">{t("mock.deals", "Active Pre-Deals")}</div>
                      <div className="mt-1 text-xl font-black text-white font-mono">12</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[10px] text-white/40 uppercase font-mono">{t("mock.val", "Trade Value")}</div>
                      <div className="mt-1 text-xl font-black text-white font-mono">$2.4M</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[10px] text-white/40 uppercase font-mono">{t("mock.score", "Match Score")}</div>
                      <div className="mt-1 text-xl font-black text-yellow-400 font-mono">94</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">{t("mock.prod", "Premium Iraqi Dates")}</div>
                      <div className="text-xs text-yellow-400 font-mono bg-yellow-400/10 px-2 py-0.5 rounded">{t("mock.rec", "Recommended")}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 font-mono pt-1">
                      <span>300 Ton</span>
                      <span>•</span>
                      <span>$2.65 / Ton</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Escrow Custody</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-neutral-950 select-none">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {stats.map((s, idx) => (
            <div key={idx} className="py-10 text-center sm:px-4">
              <p className="font-serif text-3xl font-medium text-white sm:text-4xl font-mono">{s.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="platform" className="py-24 lg:py-32 select-text">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">{t("The Platform", "The Platform")}</p>
            <h2 className="font-serif text-4xl font-medium text-white sm:text-5xl">
              {t("Built for the full deal cycle", "Built for the full deal cycle")}
            </h2>
            <p className="text-lg text-white/40 leading-relaxed">
              {t("From discovery to settlement, every step is engineered for institutional trust and velocity.", "From discovery to settlement, every step is engineered for institutional trust and velocity.")}
            </p>
          </div>
          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
            {features.map((f, fIdx) => (
              <div key={fIdx} className="group bg-black p-8 transition-colors hover:bg-neutral-950 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master Tiers Section */}
      <section id="tiers" className="border-y border-white/10 bg-neutral-950 py-24 lg:py-32 select-none">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">{t("Membership", "Membership")}</p>
            <h2 className="font-serif text-4xl font-medium text-white sm:text-5xl">
              {t("Master Accounts", "Master Accounts")}
            </h2>
            <p className="text-lg text-white/40 leading-relaxed">
              {t("Tiered access designed for every scale of international trade.", "Tiered access designed for every scale of international trade.")}
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {tiers.map((tItem, tIdx) => (
              <div
                key={tIdx}
                className={`relative rounded-2xl border p-6 transition-all hover:border-yellow-500/50 flex flex-col justify-between ${
                  tItem.highlight
                    ? "border-yellow-500 bg-yellow-500/10 shadow-lg scale-105 z-10"
                    : "border-white/10 bg-black hover:bg-neutral-900"
                }`}
              >
                {tItem.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-500 px-4 py-1 text-xs font-black uppercase tracking-wider text-black">
                    {t("Most popular", "Most popular")}
                  </div>
                )}
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-white/40">{tItem.name}</p>
                  <p className="mt-4 font-serif text-4xl font-extrabold text-white font-mono">{tItem.price}</p>
                  <p className="text-xs text-white/30 mt-1">{tItem.note}</p>
                </div>

                <ul className="mt-8 space-y-3 text-xs sm:text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{t("Priority deal access", "Priority deal access")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{t("Reduced commission", "Reduced commission")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{t("Dedicated support", "Dedicated support")}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corridors Section */}
      <section id="corridors" className="py-24 lg:py-32 select-none">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">{t("nav.corridors", "Corridors")}</p>
            <h2 className="font-serif text-4xl font-medium text-white sm:text-5xl">
              {t("Active trade lanes", "Active trade lanes")}
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { from: t("Iraq", "Iraq"), to: t("Turkey", "Turkey"), goods: t("Dates, Phosphate, Marble", "Dates, Phosphate, Marble"), icon: LayoutDashboard },
              { from: t("Iran", "Iran"), to: t("Turkey / EU", "Turkey / EU"), goods: t("Steel Scrap, Petrochemicals", "Steel Scrap, Petrochemicals"), icon: Handshake },
              { from: t("Turkey", "Turkey"), to: t("Global", "Global Markets"), goods: t("Processed commodities, Textiles", "Processed commodities, Textiles"), icon: Globe },
            ].map((c, cIdx) => (
              <div key={cIdx} className="rounded-2xl border border-white/10 bg-neutral-950 p-7 space-y-6 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">{c.from}</span>
                  <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-400">
                    <ArrowRight className={dir === "rtl" ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
                  </div>
                  <span className="text-xl font-bold text-white">{c.to}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs text-yellow-400 uppercase tracking-wider font-bold block mb-1">Authenticated Flows:</span>
                  <p className="text-sm text-white/60 font-medium">{c.goods}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-white/10 bg-neutral-950 py-24 select-none">
        <div className="mx-auto max-w-3xl px-6 text-center space-y-6">
          <h2 className="font-serif text-4xl font-medium text-white sm:text-5xl leading-tight">
            {t("Join the private network", "Join the private B2B network")}
          </h2>
          <p className="text-lg text-white/40 leading-relaxed">
            {t("Priority access is limited. Apply today and our team will review your membership.", "Priority access is limited. Apply today and our team will review your membership.")}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 rounded-full bg-yellow-500 px-8 py-4 text-base font-bold text-black transition-colors hover:bg-yellow-400"
          >
            <span>{t("nav.access", "Access Terminal")}</span>
            <ArrowRight className={dir === "rtl" ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 select-none">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500/10">
                <span className="font-serif text-lg font-bold text-yellow-400">T</span>
              </div>
              <span className="font-serif text-xl font-medium tracking-wide text-white">
                Tureep <span className="text-yellow-400">AI+</span>
              </span>
            </Link>
            <p className="text-sm text-white/30 font-mono">
              {t("© 2026 Tureep Trade Systems. All rights reserved.", "© 2026 Tureep Trade Systems. All rights reserved.")}
            </p>
            <div className="flex gap-8 text-sm font-medium text-white/40">
              <Link to="/login" className="hover:text-white">{t("nav.signin", "Sign in")}</Link>
              <Link to="/dashboard" className="hover:text-white">{t("nav.dashboard", "Dashboard")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
