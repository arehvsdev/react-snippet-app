import React, { useState, useEffect } from "react";
import { Sparkles, Crown, ShieldCheck, ArrowRight, Code, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../layouts/AuthContext";
import { PlanBadge } from "./PlanBadge";
import { ProBadge } from "./ProBadge";
import { UpgradeModal } from "./UpgradeModal";
import { getSnippets } from "../../services/snippetService";

interface SubscriptionWidgetProps {
  className?: string;
  totalSnippets?: number;
  privateSnippets?: number;
}

/**
 * User Dashboard Subscription Widget Component.
 * Displays 4 simple metric cards:
 * 1. Current Plan (FREE / PRO)
 * 2. Total Snippets
 * 3. Private Snippets
 * 4. Payment Status (ACTIVE)
 * 
 * If user is FREE: Shows an info card promoting PRO features with an "Upgrade Now" button opening UpgradeModal.
 */
export const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({
  className = "",
  totalSnippets: propTotalSnippets,
  privateSnippets: propPrivateSnippets,
}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetStats, setSnippetStats] = useState({ total: 0, privateCount: 0 });

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isPro = user?.plan === "PRO" || isAdmin;

  // Do not render subscription widget for admin users
  if (isAdmin) return null;

  // Fetch user snippet counts if not provided via props
  useEffect(() => {
    if (typeof propTotalSnippets === "number" && typeof propPrivateSnippets === "number") {
      setSnippetStats({ total: propTotalSnippets, privateCount: propPrivateSnippets });
      return;
    }

    if (user) {
      const userId = user.id || user.uid;
      getSnippets({ userId })
        .then((snippets) => {
          const total = snippets.length;
          const privateCount = snippets.filter((s: any) => s.visibility === "private").length;
          setSnippetStats({ total, privateCount });
        })
        .catch(() => {});
    }
  }, [user, propTotalSnippets, propPrivateSnippets]);

  const total = propTotalSnippets ?? snippetStats.total;
  const privateCount = propPrivateSnippets ?? snippetStats.privateCount;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 4 Simple Dashboard Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Current Plan */}
        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700/80 shadow-md space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" /> Current Plan
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {isAdmin ? (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                ADMIN
              </span>
            ) : isPro ? (
              <ProBadge size="xs" />
            ) : (
              <PlanBadge plan="FREE" size="sm" />
            )}
          </div>
        </div>

        {/* Card 2: Total Snippets */}
        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700/80 shadow-md space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Code className="w-3 h-3 text-blue-400" /> Total Snippets
          </span>
          <p className="text-lg font-bold text-white pt-0.5">{total}</p>
        </div>

        {/* Card 3: Private Snippets */}
        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700/80 shadow-md space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> Private Snippets
          </span>
          <p className="text-sm font-bold text-amber-300 pt-0.5">
            {isPro ? privateCount : "PRO Only"}
          </p>
        </div>

        {/* Card 4: Payment Status */}
        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700/80 shadow-md space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Payment Status
          </span>
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
          </p>
        </div>
      </div>

      {/* Info Card for FREE users */}
      {!isPro && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 space-y-3 shadow-md">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Upgrade to PRO for:
            </h4>
            <ul className="space-y-1 text-xs text-gray-300 font-medium">
              <li className="flex items-center gap-1.5 text-gray-200">• Unlimited snippets</li>
              <li className="flex items-center gap-1.5 text-gray-200">• Private snippets</li>
              <li className="flex items-center gap-1.5 text-gray-200">• Premium features</li>
            </ul>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SubscriptionWidget;
