import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Globe,
  Shield,
  ChevronRight,
  Star,
  CheckCircle2,
  Crown,
  Zap,
  Sparkles,
  Gem,
  Diamond
} from "lucide-react";
import { getMySubscription, createCheckoutSession, cancelSubscription, type Subscription } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Star,
    color: "bg-surface-100 text-surface-600",
    features: ["Basic product listing", "5 AI matches/month", "Standard support", "120h deal delay"],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "bronze",
    name: "Bronze",
    price: "$49",
    period: "/month",
    icon: Zap,
    color: "bg-amber-100 text-amber-700",
    features: ["Up to 20 products", "25 AI matches/month", "Email support", "72h deal delay", "Basic analytics"],
    cta: "Upgrade",
    popular: false,
  },
  {
    id: "silver",
    name: "Silver",
    price: "$149",
    period: "/month",
    icon: Sparkles,
    color: "bg-slate-200 text-slate-700",
    features: ["Unlimited products", "100 AI matches/month", "Priority support", "24h deal delay", "Full analytics", "L/C support"],
    cta: "Upgrade",
    popular: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: "$399",
    period: "/month",
    icon: Crown,
    color: "bg-yellow-100 text-yellow-700",
    features: ["Unlimited everything", "500 AI matches/month", "Dedicated manager", "Instant deals", "ML predictions", "Escrow priority"],
    cta: "Upgrade",
    popular: false,
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "$999",
    period: "/month",
    icon: Gem,
    color: "bg-indigo-100 text-indigo-700",
    features: ["Enterprise features", "Unlimited matches", "24/7 concierge", "Instant deals", "Custom ML models", "White-glove onboarding"],
    cta: "Upgrade",
    popular: false,
  },
  {
    id: "black",
    name: "Black",
    price: "Custom",
    period: "",
    icon: Diamond,
    color: "bg-surface-800 text-white",
    features: ["Bespoke solutions", "Dedicated infrastructure", "Custom integrations", "SLA guarantees", "Executive reporting", "Private corridors"],
    cta: "Contact Sales",
    popular: false,
  },
];

function SettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "billing" | "notifications">("account");

  useEffect(() => {
    getMySubscription()
      .then(setSubscription)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(tier: string) {
    if (tier === "black") return;
    setUpgrading(true);
    try {
      await createCheckoutSession(tier);
      const updated = await getMySubscription();
      setSubscription(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  }

  async function handleCancel() {
    try {
      await cancelSubscription();
      const updated = await getMySubscription();
      setSubscription(updated);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Settings</h1>
        <p className="text-sm text-surface-500 mt-0.5">Manage your account, billing, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-200">
        {[
          { id: "account", label: "Account", icon: User },
          { id: "billing", label: "Billing & Plan", icon: CreditCard },
          { id: "notifications", label: "Notifications", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-surface-200">
            <h3 className="font-bold text-surface-800 mb-4">Profile Information</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="Istanbul Imports Ltd."
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="buyer.turkey@tureep.ai"
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+905301234567"
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-2">Country</label>
                <input
                  type="text"
                  defaultValue="Turkey"
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-surface-200">
            <h3 className="font-bold text-surface-800 mb-4">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm font-semibold text-surface-800">Two-Factor Authentication</p>
                    <p className="text-xs text-surface-500">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm font-semibold text-surface-800">Language & Region</p>
                    <p className="text-xs text-surface-500">English (US) · UTC+3</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-2xl p-6 border border-surface-200">
            <h3 className="font-bold text-surface-800 mb-4">Current Plan</h3>
            {subscription ? (
              <div className="flex items-center justify-between p-5 bg-primary-50 border border-primary-200 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-surface-800 capitalize">{subscription.tier} Plan</p>
                    <p className="text-sm text-surface-500">
                      Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-success-50 text-success-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-surface-500">Loading subscription details...</p>
              </div>
            )}
          </div>

          {/* Plans Grid */}
          <div>
            <h3 className="font-bold text-surface-800 mb-4">Available Plans</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                const isCurrent = subscription?.tier === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isCurrent
                        ? "border-primary-500 ring-2 ring-primary-100"
                        : tier.popular
                        ? "border-accent-300 ring-1 ring-accent-100"
                        : "border-surface-200 card-hover"
                    }`}
                  >
                    {tier.popular && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-500 text-white uppercase tracking-wider mb-3">
                        Most Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500 text-white uppercase tracking-wider mb-3">
                        Current Plan
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-xl ${tier.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-surface-800">{tier.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1 mb-4">
                      <span className="text-2xl font-bold text-surface-800">{tier.price}</span>
                      <span className="text-sm text-surface-500">{tier.period}</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-surface-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success-500 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading || isCurrent}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isCurrent
                          ? "bg-surface-100 text-surface-400 cursor-not-allowed"
                          : tier.popular
                          ? "bg-accent-500 text-white hover:bg-accent-600"
                          : "bg-surface-100 text-surface-700 hover:bg-surface-200"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : upgrading ? "Processing..." : tier.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl p-6 border border-surface-200 space-y-6">
          <h3 className="font-bold text-surface-800">Notification Preferences</h3>
          {[
            { label: "Deal Alerts", desc: "Get notified when new AI matches are found", checked: true },
            { label: "Order Updates", desc: "Status changes for your orders and shipments", checked: true },
            { label: "Price Alerts", desc: "Market price movements for your commodities", checked: false },
            { label: "Compliance Alerts", desc: "KYC and sanctions screening updates", checked: true },
            { label: "Payment Notifications", desc: "Escrow releases and payment confirmations", checked: true },
            { label: "Marketing & Updates", desc: "Product updates and platform news", checked: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
              <div>
                <p className="text-sm font-semibold text-surface-800">{item.label}</p>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
