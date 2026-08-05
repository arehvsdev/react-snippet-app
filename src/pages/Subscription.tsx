import { useState } from "react";
import { Layout } from "./Layout";
import { Sparkles, ShieldCheck, Crown, Calendar, CheckCircle2, ArrowRight, RefreshCcw } from "lucide-react";
import { useAuth } from "../layouts/AuthContext";
import { PlanBadge } from "../components/subscription/PlanBadge";
import { UpgradeModal } from "../components/subscription/UpgradeModal";
import { toast } from "react-hot-toast";

export function Subscription() {
  const { user, setPlan } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPro = user?.plan === "PRO";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Aug 2026";

  const handleDowngrade = () => {
    setPlan("FREE");
    toast.success("Switched back to FREE plan");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-800/80 border border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">Subscription Management</h1>
                <PlanBadge plan={user?.plan || "FREE"} size="md" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                View your current membership tier, payment verification status, and plan privileges.
              </p>
            </div>

            {!isPro ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 text-sm"
              >
                <Sparkles className="w-4 h-4 fill-current" /> Upgrade to PRO
              </button>
            ) : (
              <button
                onClick={handleDowngrade}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Switch to FREE
              </button>
            )}
          </div>

          {/* Current Membership Overview Card */}
          <div className="bg-gray-800/80 border border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isPro ? (
                <>
                  <Crown className="w-5 h-5 text-amber-400 fill-current" /> ⭐ PRO MEMBER Overview
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-blue-400" /> Current Plan Overview
                </>
              )}
            </h2>

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current Plan</span>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  {user?.plan || "FREE"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                <p className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Member Since</span>
                <p className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> {memberSince}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Payment Status</span>
                <p className="text-lg font-bold text-blue-400 flex items-center gap-1.5">
                  {isPro ? "Verified (UI)" : "N/A (Free Tier)"}
                </p>
              </div>
            </div>
          </div>

          {/* PRO Privileges Showcase */}
          <div className="bg-gray-800/80 border border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white">Subscription Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-700/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Private Snippet Quota</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isPro ? "Unlimited private code storage enabled." : "No Private Snippets allowed on Free tier."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-700/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Gold PRO Badge</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isPro ? "Active & rendered across navbar, profile & comments." : "Upgrade to PRO to showcase badge across UI."}
                  </p>
                </div>
              </div>
            </div>

            {!isPro && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-amber-300">Ready to unlock unlimited private storage?</p>
                  <p className="text-xs text-gray-400">Get unlimited private snippets and premium badges for ₹199/month.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-400 text-xs flex items-center gap-1 flex-shrink-0"
                >
                  Upgrade <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}

export default Subscription;
