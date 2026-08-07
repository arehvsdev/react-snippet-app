import { useState, useEffect, useCallback } from "react";
import { Layout } from "./Layout";
import {
  Sparkles,
  ShieldCheck,
  Crown,
  Calendar,
  CreditCard,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../layouts/AuthContext";
import { PlanBadge } from "../components/subscription/PlanBadge";
import { ProBadge } from "../components/subscription/ProBadge";
import { UpgradeModal } from "../components/subscription/UpgradeModal";
import {
  getSubscription,
  getPaymentHistory,
  type SubscriptionData,
  type PaymentRecord,
} from "../services/paymentService";

/**
 * Formats ISO date string into readable format (e.g., Aug 7, 2026).
 */
const formatDate = (isoDate?: string | null): string => {
  if (!isoDate) return "N/A";
  try {
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

/**
 * Formats amount from paise to INR currency string (e.g., 19900 -> ₹199).
 */
const formatAmount = (paise?: number): string => {
  if (typeof paise !== "number" || isNaN(paise)) return "₹0";
  return `₹${Math.round(paise / 100)}`;
};

/**
 * Simple Subscription Dashboard Component.
 * Fetches and displays current plan, status, payment details, and simple payment history table.
 * Automatically refreshes live state upon payment authorization or subscription updates.
 */
export function Subscription() {
  const { user, refreshSubscription } = useAuth();

  // State management
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Effective plan check
  const currentPlan = subscription?.plan ?? user?.plan ?? "FREE";
  const isPro = currentPlan === "PRO";

  /**
   * Fetches backend subscription and payment history via GET /subscription & GET /payment/history.
   */
  const loadSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      const [subData, historyData] = await Promise.all([
        getSubscription().catch(() => null),
        getPaymentHistory(1, 10).catch(() => ({ payments: [] })),
      ]);

      if (subData) {
        setSubscription(subData);
      }
      if (historyData?.payments) {
        setPayments(historyData.payments);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subscription data on mount & subscribe to live 'subscription-updated' events
  useEffect(() => {
    loadSubscriptionData();

    const handleSubscriptionUpdated = () => {
      loadSubscriptionData();
    };

    window.addEventListener("subscription-updated", handleSubscriptionUpdated);
    return () => {
      window.removeEventListener("subscription-updated", handleSubscriptionUpdated);
    };
  }, [loadSubscriptionData]);

  // Derive latest payment metadata
  const latestPayment = payments.find((p) => p.status === "SUCCESS") || payments[0];
  const paymentDate = subscription?.paymentDate || latestPayment?.createdAt || null;
  const paymentId = subscription?.paymentId || latestPayment?.paymentId || "N/A";
  const currentAmount = isPro ? 19900 : 0;
  const paymentGateway = "Razorpay";

  // Callback when modal upgrade completes
  const handleModalClose = async () => {
    setIsModalOpen(false);
    await refreshSubscription();
    await loadSubscriptionData();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Subscription Dashboard</h1>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : isPro ? (
                  <ProBadge size="sm" />
                ) : (
                  <PlanBadge plan="FREE" size="sm" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                View your active membership plan details and past payment transaction records.
              </p>
            </div>

            {/* Upgrade / Current Plan CTA */}
            {isPro ? (
              <button
                disabled
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-semibold text-sm text-gray-400 bg-gray-800 border border-gray-700 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Current Plan
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-400 transition-all flex items-center justify-center gap-2 shadow-md text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" /> Upgrade to PRO
              </button>
            )}
          </div>

          {/* Subscription Overview Details */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {isPro ? (
                <>
                  <Crown className="w-5 h-5 text-amber-400 fill-current" /> Subscription Details
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-blue-400" /> Subscription Details
                </>
              )}
            </h2>

            {loading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-400">Loading subscription details...</span>
              </div>
            ) : (
              /* Details Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Current Plan */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Current Plan</span>
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    {currentPlan} {isPro && <ProBadge size="xs" />}
                  </p>
                </div>

                {/* Subscription Status */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                  <p className="text-lg font-bold text-emerald-400">
                    {subscription?.status || "ACTIVE"}
                  </p>
                </div>

                {/* Payment Date */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Payment Date
                  </span>
                  <p className="text-base font-bold text-gray-200">{formatDate(paymentDate)}</p>
                </div>

                {/* Current Amount */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Current Amount</span>
                  <p className="text-lg font-bold text-white">{formatAmount(currentAmount)}</p>
                </div>

                {/* Payment Gateway */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Payment Gateway
                  </span>
                  <p className="text-base font-bold text-purple-300">{paymentGateway}</p>
                </div>

                {/* Payment ID */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-amber-400" /> Payment ID
                  </span>
                  <p className="text-xs font-mono font-bold text-amber-300 truncate">
                    {paymentId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment History Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg space-y-5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Payment History</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-400">Loading payment history...</span>
              </div>
            ) : payments.length === 0 ? (
              /* Friendly Empty State */
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 bg-gray-900/40 rounded-xl border border-gray-700/50">
                <AlertCircle className="w-8 h-8 text-gray-500" />
                <p className="text-sm font-semibold text-gray-300">No payment history found</p>
                <p className="text-xs text-gray-500">Your past payment transactions will appear here.</p>
              </div>
            ) : (
              /* Simple Table */
              <div className="overflow-x-auto rounded-xl border border-gray-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-900/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/60 bg-gray-900/40">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {p.plan === "PRO" ? (
                            <span className="text-amber-300 font-bold">PRO</span>
                          ) : (
                            <span className="text-gray-300">FREE</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                          {formatAmount(p.amount)}
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          {p.status === "SUCCESS" ? (
                            <span className="text-emerald-400">SUCCESS</span>
                          ) : p.status === "FAILED" ? (
                            <span className="text-red-400">FAILED</span>
                          ) : (
                            <span className="text-amber-400">{p.status}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-amber-300 font-mono text-xs whitespace-nowrap">
                          {p.paymentId || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Existing Upgrade Modal */}
      <UpgradeModal isOpen={isModalOpen} onClose={handleModalClose} />
    </Layout>
  );
}

export default Subscription;
