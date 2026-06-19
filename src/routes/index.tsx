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
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

export default function Index() {
  const { language, setLanguage, t, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const stats = [
    { value: <span dir="ltr">$4.2B+</span>, label: t("stat.l1", "Trade value screened") },
    { value: <span dir="ltr">12,800+</span>, label: t("stat.l2", "Pre-deals generated") },
    { value: <span dir="ltr">1,400+</span>, label: t("stat.l3", "Verified members") },
    { value: <span dir="ltr">24</span>, label: t("stat.l4", "Active corridors") },
  ];

  const features = [
    {
      icon: Sparkles,
      title: t("feat.1.t", "Smart Trade Matching"),
      description: t("feat.1.d", "Proactive rule-based heuristics across price, reputation, urgency, and operational criteria to surface authentic counterparties."),
    },
    {
      icon: Shield,
      title: t("feat.2.t", "Institutional Trust"),
      description: t("feat.2.d", "Verified companies, sanctions screening, and structured payment workflows on every deal."),
    },
    {
      icon: TrendingUp,
      title: t("feat.3.t", "Logistics Clearing"),
      description: t("feat.3.d", "Shipping quotes, customs-aware routing, and tracking consolidated inside the deal timeline."),
    },
    {
      icon: Globe,
      title: t("feat.4.t", "Market Intelligence"),
      description: t("feat.4.d", "Price signals, demand forecasting, and corridor analytics reserved for Master Account holders."),
    },
  ];

  const tiers = [
    { name: "Bronze", price: "$100", note: t("tier.month", "per month"), highlight: false },
    { name: "Silver", price: "$300", note: t("tier.month", "per month"), highlight: false },
    { name: "Gold", price: "$1,000", note: t("tier.month", "per month"), highlight: true },
    { name: "Platinum", price: "$5,000", note: t("tier.month", "per month"), highlight: false },
    { name: "Black", price: "$20,000", note: t("tier.month", "per month"), highlight: false },
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

  const isRtl = dir === "rtl";

  return (
    <div className={`min-h-screen bg-black text-white ${isRtl ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      {/* Top Fixed Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md select-none">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500/10">
              <span className="font-serif text-lg font-bold text-yellow-400">T</span>
            </div>
            <span className="font-serif text-xl font-medium tracking-wide text-white">
              Tureep <span className="text-yellow-400 font-bold">AI+</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium tracking-wide text-white/60 md:flex">
            <a href="#platform" className="hover:text-white transition-colors">{t("feat.tag", "Platform")}</a>
            <a href="#tiers" className="hover:text-white transition-colors">{t("tier.tag", "Membership")}</a>
            <a href="#corridors" className="hover:text-white transition-colors">{t("corr.tag", "Corridors")}</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-white/60 hover:text-white sm:block transition-colors">
              {t("btn.signin", "Sign in")}
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-5 py-2.5 text-xs sm:text-sm font-bold text-yellow-400 transition-all hover:bg-yellow-500 hover:text-black shadow-md"
            >
              <span>{t("nav.access", "Access Terminal")}</span>
              <ChevronRight className={isRtl ? "h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" : "h-4 w-4 transition-transform group-hover:translate-x-0.5"} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-36 select-text pb-20 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black select-none"></div>
        <div className="absolute right-0 top-20 h-[400px] w-[400px] rounded-full bg-yellow-500/5 blur-[120px] select-none"></div>

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 space-y-12">
          
          {/* Extremely Prominent In-Hero Language Switcher Bar */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border-2 border-yellow-500/80 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 select-none max-w-4xl mx-auto text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <Globe className="h-6 w-6 text-yellow-400 animate-spin flex-shrink-0" style={{ animationDuration: "12s" }} />
              <div className={isRtl ? "text-right font-mono" : "text-left font-mono"}>
                <span className="text-yellow-400 font-extrabold block text-sm tracking-wider">{t("lang.switch", "Select Target App Language & RTL Feature:")}</span>
                <span className="text-white/50 text-xs">Bi-directional MIRRORING active for Middle East corridors</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => setLanguage("ar")}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-black tracking-wider transition-all select-none flex items-center gap-1.5 ${
                  language === "ar"
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : "bg-black/80 text-white border border-white/20 hover:border-yellow-400 hover:text-yellow-300"
                }`}
              >
                <span>🇸🇦</span>
                <span>العربية (RTL)</span>
              </button>
              
              <button
                onClick={() => setLanguage("tr")}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-black tracking-wider transition-all select-none flex items-center gap-1.5 ${
                  language === "tr"
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : "bg-black/80 text-white border border-white/20 hover:border-yellow-400 hover:text-yellow-300"
                }`}
              >
                <span>🇹🇷</span>
                <span>Türkçe (LTR)</span>
              </button>

              <button
                onClick={() => setLanguage("ku")}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-black tracking-wider transition-all select-none flex items-center gap-1.5 ${
                  language === "ku"
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : "bg-black/80 text-white border border-white/20 hover:border-yellow-400 hover:text-yellow-300"
                }`}
              >
                <span>☀️</span>
                <span>کوردی (RTL)</span>
              </button>

              <button
                onClick={() => setLanguage("fa")}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-black tracking-wider transition-all select-none flex items-center gap-1.5 ${
                  language === "fa"
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : "bg-black/80 text-white border border-white/20 hover:border-yellow-400 hover:text-yellow-300"
                }`}
              >
                <span>🇮🇷</span>
                <span>فارسی (RTL)</span>
              </button>

              <button
                onClick={() => setLanguage("en")}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-black tracking-wider transition-all select-none flex items-center gap-1.5 ${
                  language === "en"
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : "bg-black/80 text-white border border-white/20 hover:border-yellow-400 hover:text-yellow-300"
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-yellow-400 select-none">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>{t("hero.tag", "Private member network")}</span>
              </div>

              <h1 className="font-serif text-5xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t("hero.title", "Trade at the speed of intelligence")}
              </h1>

              <p className="text-lg leading-relaxed text-white/60 font-medium">
                {t("hero.subtitle", "Tureep AI+ connects verified sellers and buyers across MENA and global corridors. Our platform pre-generates institutional deal opportunities, clears compliance, and orchestrates haulage --- before the first message is sent.")}
              </p>

              <form onSubmit={handleSubmit} className="pt-4 flex flex-col gap-3 sm:flex-row max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("hero.input", "Business email address")}
                  disabled={status === "loading"}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-yellow-500/80 focus:bg-white/10 transition-colors disabled:opacity-50 font-mono"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-yellow-500 px-8 py-4 text-sm font-black text-black transition-all hover:bg-yellow-400 disabled:opacity-50 select-none shadow-lg hover:scale-105"
                >
                  <span>{status === "loading" ? t("Applying...", "Applying...") : t("hero.req", "Request access")}</span>
                  <ArrowRight className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
                </button>
              </form>

              {status === "success" && (
                <p className="text-sm font-bold text-yellow-400 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">{message}</p>
              )}
              {status === "error" && <p className="text-sm font-bold text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{message}</p>}
              
              <p className="text-xs text-white/40 leading-relaxed font-mono">
                {t("hero.disclaimer", "Membership is reviewed. Priority given to commodity traders, manufacturers, and logistics operators.")}
              </p>
            </div>

            {/* Platform Interactive Terminal Mockup */}
            <div className="relative select-none">
              <div className="absolute -inset-4 rounded-3xl bg-yellow-500/10 blur-2xl"></div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3.5 bg-neutral-950">
                  <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  <div className="mx-4 text-xs font-bold text-white/50 font-mono tracking-wider">{t("mock.head", "Tureep AI+ Terminal")}</div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch">
                  <div className="border-b sm:border-b-0 sm:border-x border-white/10 p-4 bg-neutral-950 flex sm:flex-col items-center justify-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-black font-serif text-base shadow-inner">T</div>
                    <div className="h-8 w-8 rounded-lg bg-white/5"></div>
                    <div className="h-8 w-8 rounded-lg bg-white/5"></div>
                  </div>

                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-white/40 uppercase tracking-widest font-mono">{t("mock.dash", "Dashboard")}</div>
                      <div className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3.5 py-1 text-xs font-black text-yellow-400 shadow-sm">{t("mock.role", "Gold Member")}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center shadow-inner">
                        <div className="text-[10px] font-bold text-white/40 uppercase font-mono">{t("mock.deals", "Active Pre-Deals")}</div>
                        <div className="mt-1 text-2xl font-black text-white font-mono">12</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center shadow-inner">
                        <div className="text-[10px] font-bold text-white/40 uppercase font-mono">{t("mock.val", "Trade Value")}</div>
                        <div className="mt-1 text-2xl font-black text-white font-mono">$2.4M</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center shadow-inner">
                        <div className="text-[10px] font-bold text-white/40 uppercase font-mono">{t("mock.score", "Match Score")}</div>
                        <div className="mt-1 text-2xl font-black text-yellow-400 font-mono">94</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="text-base font-black text-white">{t("mock.prod", "Premium Iraqi Dates")}</div>
                        <span className="text-xs font-black text-neutral-900 bg-yellow-400 px-3 py-0.5 rounded-full uppercase tracking-wider font-mono self-start sm:self-auto shadow-sm">
                          {t("mock.rec", "Recommended")}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-xs text-white/70 font-mono leading-relaxed space-y-1">
                        <p>● {t("mock.terms", "300 ton • $2.65 / ton • Escrow")}</p>
                        <p className="text-emerald-400 font-bold">● Protected via Institutional Neutral Custody Subsystem</p>
                      </div>
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
            <div key={idx} className="py-12 text-center sm:px-6 hover:bg-white/5 transition-colors">
              <p className="font-serif text-4xl sm:text-5xl font-extrabold text-white font-mono">{s.value}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-widest text-yellow-400/80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="platform" className="py-24 lg:py-32 select-text">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 font-mono">{t("feat.tag", "The Platform")}</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
              {t("feat.title", "Built for the full deal cycle")}
            </h2>
            <p className="text-lg text-white/50 leading-relaxed font-medium">
              {t("feat.subtitle", "From discovery to settlement, every step is engineered for institutional trust and velocity.")}
            </p>
          </div>

          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden border border-white/10">
            {features.map((f, fIdx) => (
              <div key={fIdx} className="group bg-neutral-950 p-10 transition-colors hover:bg-neutral-900 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-wide">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/50 font-medium">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <section id="tiers" className="border-y border-white/10 bg-neutral-950 py-24 lg:py-32 select-none">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 font-mono">{t("tier.tag", "Membership")}</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
              {t("tier.title", "Master Accounts")}
            </h2>
            <p className="text-lg text-white/50 leading-relaxed font-medium">
              {t("tier.subtitle", "Tiered access designed for every scale of international trade.")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
            {tiers.map((tItem, tIdx) => (
              <div
                key={tIdx}
                className={`relative rounded-3xl border p-7 transition-all flex flex-col justify-between ${
                  tItem.highlight
                    ? "border-yellow-500 bg-gradient-to-b from-yellow-500/20 to-black shadow-2xl scale-105 z-10"
                    : "border-white/10 bg-black hover:border-yellow-500/50 hover:bg-neutral-900/60"
                }`}
              >
                {tItem.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-yellow-500 px-5 py-1.5 text-xs font-black uppercase tracking-widest text-black shadow-lg">
                    {t("tier.popular", "Most popular")}
                  </div>
                )}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-yellow-400 font-mono">{tItem.name}</p>
                  <p className="mt-4 font-serif text-4xl font-extrabold text-white font-mono">{tItem.price}</p>
                  <p className="text-xs text-white/40 mt-1 font-mono">{tItem.note}</p>
                </div>

                <ul className="mt-10 space-y-4 text-xs sm:text-sm text-white/70 font-medium border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{t("tier.f1", "Priority deal access")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{t("tier.f2", "Reduced commission")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{t("tier.f3", "Dedicated support")}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corridors Section */}
      <section id="corridors" className="py-24 lg:py-32 select-none">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 font-mono">{t("corr.tag", "Corridors")}</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
              {t("corr.title", "Active trade lanes")}
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3 items-stretch">
            {[
              { from: t("corr.c1.from", "Iraq"), to: t("corr.c1.to", "Turkey"), goods: t("corr.c1.goods", "Dates, Phosphate, Marble") },
              { from: t("corr.c2.from", "Iran"), to: t("corr.c2.to", "Turkey / EU"), goods: t("corr.c2.goods", "Steel Scrap, Petrochemicals") },
              { from: t("corr.c3.from", "Turkey"), to: t("corr.c3.to", "Global Markets"), goods: t("corr.c3.goods", "Processed commodities, Textiles") },
            ].map((c, cIdx) => (
              <div key={cIdx} className="rounded-3xl border border-white/10 bg-neutral-950 p-8 space-y-6 hover:border-yellow-500/50 transition-all shadow-xl hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white tracking-wide">{c.from}</span>
                  <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <ArrowRight className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
                  </div>
                  <span className="text-2xl font-bold text-white tracking-wide">{c.to}</span>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-1">
                  <span className="text-xs text-yellow-400 uppercase tracking-widest font-black font-mono block">Authenticated Commodity Corridor:</span>
                  <p className="text-base text-white/70 font-medium leading-relaxed">{c.goods}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-white/10 bg-neutral-950 py-24 select-none">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
          <h2 className="font-serif text-4xl font-extrabold text-white sm:text-6xl leading-tight">
            {t("cta.title", "Join the private B2B network")}
          </h2>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-medium">
            {t("cta.subtitle", "Priority access is limited. Apply today and our team will review your corporate Node.")}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3.5 rounded-full bg-yellow-500 px-10 py-5 text-base sm:text-lg font-black text-black transition-all hover:bg-yellow-400 shadow-2xl hover:scale-105 select-none"
          >
            <span>{t("nav.access", "Access Terminal")}</span>
            <ArrowRight className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
          </Link>
        </div>
      </section>

      {/* Footer Line */}
      <footer className="bg-black py-14 select-none border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row text-center sm:text-left">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/50 bg-yellow-500/10">
                <span className="font-serif text-lg font-bold text-yellow-400">T</span>
              </div>
              <span className="font-serif text-xl font-medium tracking-wide text-white">
                Tureep <span className="text-yellow-400 font-bold">AI+</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-white/40 font-mono tracking-wide">
              {t("foot.copy", "© 2026 Tureep Trade Systems. All rights reserved.")}
            </p>

            <div className="flex flex-wrap justify-center gap-8 text-xs sm:text-sm font-bold text-white/60">
              <Link to="/login" className="hover:text-yellow-400 transition-colors">{t("nav.signin", "Sign in")}</Link>
              <Link to="/dashboard" className="hover:text-yellow-400 transition-colors">{t("nav.dashboard", "Dashboard")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
