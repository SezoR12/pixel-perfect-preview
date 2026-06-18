import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroMap from "@/assets/hero-map.jpg";
import catDates from "@/assets/cat-dates.jpg";
import catSteel from "@/assets/cat-steel.jpg";
import catPhosphate from "@/assets/cat-phosphate.jpg";
import { joinWaitlist } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tureep AI+ — Intelligent Corridors for Global Trade" },
      {
        name: "description",
        content:
          "AI-powered B2B trade platform connecting sellers in Iraq and Iran to buyers in Turkey and global markets. Institutional pre-deals, brokered in milliseconds.",
      },
      { property: "og:title", content: "Tureep AI+ — Intelligent Corridors for Global Trade" },
      {
        property: "og:description",
        content:
          "AI brokerage for Middle Eastern commodities. Dates, steel scrap, phosphate — matched, cleared, and shipped through a single intelligent layer.",
      },
      { property: "og:image", content: heroMap },
      { name: "twitter:image", content: heroMap },
    ],
  }),
  component: Index,
});

const tiers = [
  { idx: "01/05", name: "Bronze", swatch: "#A8715C", items: ["Basic Pre-Deal", "Standard Clearing"] },
  { idx: "02/05", name: "Silver", swatch: "#A1A1AA", items: ["24h Support", "Custom Escrow"] },
  { idx: "03/05", name: "Gold", swatch: "#D4AF37", items: ["Regional Priority", "Trade Credit"] },
  { idx: "04/05", name: "Platinum", swatch: "#E5E7EB", items: ["Direct Concierge", "Zero Lag Execution"] },
  { idx: "05/INVITE", name: "Black", swatch: "#FFFFFF", items: ["Unlimited Cap", "Institutional API"], elite: true },
];

const commodities = [
  {
    img: catDates,
    cat: "Agricultural",
    name: "Premium Dates",
    delta: "+2.4%",
    deltaUp: true,
    copy: "Direct sourcing from Basra and Ahvaz. AI-verified quality grades and moisture tracking.",
  },
  {
    img: catSteel,
    cat: "Industrial",
    name: "Steel Scrap",
    delta: "Stable",
    deltaUp: false,
    copy: "Aggregated high-yield industrial scrap routes. Real-time weight verification and logistics clearing.",
  },
  {
    img: catPhosphate,
    cat: "Chemical",
    name: "Phosphate",
    delta: "+5.1%",
    deltaUp: true,
    copy: "High-purity phosphate rock from Iraqi basins. Direct-to-port automation for global buyers.",
  },
];

function Index() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistStatus("loading");
    setWaitlistMessage("");
    try {
      await joinWaitlist(waitlistEmail);
      setWaitlistStatus("success");
      setWaitlistMessage("You're on the Tureep AI+ waitlist. We'll be in touch.");
      setWaitlistEmail("");
    } catch (err: any) {
      setWaitlistStatus("error");
      setWaitlistMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-mono font-bold tracking-tighter text-xl">TUREEP AI+</span>
            <div className="hidden md:flex gap-6 text-xs font-mono uppercase tracking-widest text-muted">
              <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
              <a href="#tiers" className="hover:text-foreground transition-colors">Tiers</a>
              <a href="#network" className="hover:text-foreground transition-colors">Network</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-xs font-mono uppercase tracking-widest hover:text-foreground transition-colors"
            >
              Sign In
            </a>
            <a
              href="/dashboard"
              className="bg-foreground text-background px-5 py-2 text-xs font-mono uppercase tracking-widest hover:bg-primary transition-all"
            >
              Terminal
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8 animate-in-up">
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                Intelligent Corridors
              </span>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-balance leading-[0.95]">
                The Route to <br />
                Global Trade.
              </h1>
              <p className="text-xl text-muted max-w-md text-pretty leading-relaxed">
                Connecting Iraq and Iran to the world through a high-fidelity AI brokerage engine.
                Institutional grade commodities, brokered in milliseconds.
              </p>
            </div>
            <form
              id="waitlist"
              onSubmit={handleWaitlistSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter institutional email"
                disabled={waitlistStatus === "loading"}
                className="bg-white border border-border px-4 py-3 w-full sm:w-80 font-mono text-sm focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={waitlistStatus === "loading"}
                className="bg-primary text-primary-foreground px-8 py-3 font-mono text-sm uppercase tracking-widest hover:bg-foreground transition-colors disabled:opacity-50"
              >
                {waitlistStatus === "loading" ? "Submitting..." : "Access Terminal"}
              </button>
            </form>
            {waitlistStatus === "success" && (
              <p className="text-sm text-green-600 font-mono">{waitlistMessage}</p>
            )}
            {waitlistStatus === "error" && (
              <p className="text-sm text-red-500 font-mono">{waitlistMessage}</p>
            )}
          </div>
          <div className="relative animate-in-up [animation-delay:200ms]">
            <img
              src={heroMap}
              alt="Trade corridor map across Basra, Tehran, and Istanbul"
              width={1280}
              height={960}
              className="w-full aspect-[4/3] object-cover rounded-sm outline outline-1 -outline-offset-1 outline-black/5"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 border border-border shadow-xl max-w-xs space-y-3">
              <div className="flex justify-between items-end">
                <span className="font-mono text-[10px] uppercase text-muted">Live Nodes</span>
                <span className="font-mono text-lg leading-none">1,402</span>
              </div>
              <div className="h-1 bg-foreground/5 w-full">
                <div className="h-full bg-primary w-2/3"></div>
              </div>
              <p className="text-[10px] font-mono text-muted uppercase">
                Iraq → Turkey throughput: +14.2%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="bg-foreground text-background py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-primary">
                Master Accounts
              </span>
              <h2 className="text-4xl font-bold tracking-tight">Select Your Tier</h2>
            </div>
            <p className="text-muted max-w-xs font-mono text-[10px] uppercase leading-relaxed">
              Each tier unlocks higher leverage, priority clearance, and deep-market analytics tools.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/10 border border-white/10">
            {tiers.map((t, i) => (
              <div
                key={t.name}
                className={`bg-foreground p-8 space-y-12 hover:bg-white/5 transition-colors group ${
                  i === 2 ? "border-x border-white/5" : i === 4 ? "border-l border-white/5" : ""
                }`}
              >
                <span
                  className={`font-mono text-[10px] text-muted ${
                    t.elite ? "tracking-tighter" : ""
                  }`}
                >
                  {t.idx}
                </span>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                  <div
                    className="h-1 w-8 mb-6 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: t.swatch }}
                  />
                  <ul
                    className={`text-[10px] font-mono uppercase space-y-2 ${
                      t.elite ? "text-background" : "text-muted"
                    }`}
                  >
                    {t.items.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commodities */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {commodities.map((c) => (
            <div key={c.name} className="space-y-4">
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                width={800}
                height={1024}
                className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
                Category: {c.cat}
              </p>
              <div className="flex justify-between items-baseline">
                <h4 className="text-2xl font-bold">{c.name}</h4>
                <span
                  className={`font-mono text-xs ${c.deltaUp ? "text-primary" : "text-muted"}`}
                >
                  {c.delta}
                </span>
              </div>
              <p className="text-sm text-muted">{c.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="network" className="border-t border-border py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <span className="font-mono font-bold tracking-tighter text-2xl">TUREEP AI+</span>
              <p className="mt-4 text-muted max-w-sm text-sm">
                The sovereign layer for Middle Eastern trade. Brokering the future of the silk road
                with neural intelligence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 col-span-2">
              <div className="space-y-4">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
                  Network Stats
                </span>
                <div className="space-y-2">
                  {[
                    ["GMV", "$4.2B"],
                    ["TRADES", "12.8K"],
                    ["NODES", "324"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-border pb-1">
                      <span className="text-[10px] font-mono">{k}</span>
                      <span className="text-[10px] font-mono text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
                  Contact Terminal
                </span>
                <p className="text-sm">desk@tureep.ai</p>
                <p className="text-[10px] font-mono text-muted uppercase">
                  DIFC, Dubai // Istanbul // Baghdad
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-12 border-t border-border flex justify-between items-center">
            <span className="text-[10px] font-mono text-muted">
              © 2026 TUREEP LOGISTICS SYSTEMS. ALL RIGHTS RESERVED.
            </span>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-muted">SYSTEMS NOMINAL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
