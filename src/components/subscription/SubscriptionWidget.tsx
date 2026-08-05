import React, { useState, useEffect } from "react";
import { Sparkles, Crown, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../layouts/AuthContext";
import { PlanBadge } from "./PlanBadge";
import { UpgradeModal } from "./UpgradeModal";
import { getSubscription } from "../../services/paymentService";

interface SubscriptionWidgetProps {
  className?: string;
}

export const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<string | null>(null);

  const isPro = user?.plan === "PRO";

  // Fetch payment date for PRO users to display in widget
  useEffect(() => {
    if (!isPro) return;
    getSubscription()
      .then((sub) => {
        if (sub.paymentDate) {
          setPaymentDate(
            new Date(sub.paymentDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          );
        }
      })
      .catch(() => {});
  }, [isPro]);

  if (isPro) {
    return (
      <>
        <div className={`bg-gradient-to-b from-gray-800 via-gray-800 to-gray-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg shadow-amber-500/5 ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
              <span className="text-sm font-bold text-white tracking-tight">Subscription</span>
            </div>
            <PlanBadge plan="PRO" size="sm" />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <span>Unlimited Private Snippets</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-amber-400/20 rounded-md border border-amber-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Your PRO tier enables unlimited private code storage &amp; gold badge rendering.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Premium Active
            </span>
            <span className="text-[10px] text-gray-500">
              {paymentDate ? `Since ${paymentDate}` : "Auto-renews monthly"}
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`bg-gray-800/90 border border-gray-700/80 rounded-2xl p-5 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold text-white tracking-tight">Subscription</span>
          </div>
          <PlanBadge plan="FREE" size="sm" />
        </div>

        {/* Usage Limits */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Snippet Quota</span>
            <span className="font-bold text-white">Up to 3 Snippets</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Private Snippets</span>
            <span className="font-bold text-amber-400">Max 5</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Bookmarks Limit</span>
            <span className="font-bold text-white">Up to 3</span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" /> Upgrade to PRO <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <UpgradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default SubscriptionWidget;
