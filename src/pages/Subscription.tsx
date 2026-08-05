import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import {
  Sparkles, ShieldCheck, Crown, Calendar, CheckCircle2,
  ArrowRight, RefreshCcw, CreditCard, Loader2, AlertCircle
} from "lucide-react";
import { useAuth } from "../layouts/AuthContext";
import { PlanBadge } from "../components/subscription/PlanBadge";
import { UpgradeModal } from "../components/subscription/UpgradeModal";
import { getSubscription, getPaymentHistory, type SubscriptionData, type PaymentRecord } from "../services/paymentService";
import { toast } from "react-hot-toast";

export function Subscription() {
  const { user, setPlan, refreshSubscription } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Live subscription state from backend
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  // Payment history state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const isPro = (subscription?.plan ?? user?.plan) === "PRO";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Aug 2026";

  // Fetch live subscription from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        setSubLoading(true);
        const sub = await getSubscription();
        setSubscription(sub);
        // Sync plan in AuthContext if it differs
        if (user && sub.plan !== user.plan) {
          setPlan(sub.plan);
        }
      } catch {
        // Fallback to AuthContext plan
      } finally {
        setSubLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch payment history
  const loadHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const result = await getPaymentHistory(page, 5);
      setPayments(result.payments);
      setPagination({
        page: result.pagination.page || page,
        pages: result.pagination.pages || 1,
        total: result.pagination.total || 0,
      });
    } catch {
      // Silent fail — no history section shown
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  const handleDowngrade = () => {
    setPlan("FREE");
    setSubscription((prev) => prev ? { ...prev, plan: "FREE" } : prev);
    toast.success("Switched back to FREE plan");
  };

  // Called when UpgradeModal succeeds to refresh subscription + history
  const handleUpgradeSuccess = async () => {
    await refreshSubscription();
    const sub = await getSubscription().catch(() => null);
    if (sub) setSubscription(sub);
    await loadHistory(1);
  };

  const formatAmount = (paise: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const statusColor = {
    SUCCESS: "text-emerald-400",
    FAILED: "text-red-400",
    CREATED: "text-yellow-400",
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-800/80 border border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">Subscription Management</h1>
                {subLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <PlanBadge plan={subscription?.plan ?? user?.plan ?? "FREE"} size="md" />
                )}
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

          {/* ── Current Plan Overview ───────────────────────────────── */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current Plan</span>
                <p className="text-lg font-bold text-white">
                  {subLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (subscription?.plan ?? user?.plan ?? "FREE")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                <p className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {subLoading ? "..." : (subscription?.status ?? "ACTIVE")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Member Since</span>
                <p className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> {memberSince}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Payment Date</span>
                <p className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                  {subLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : subscription?.paymentDate ? (
                    formatDate(subscription.paymentDate)
                  ) : (
                    isPro ? "Verified" : "N/A"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ── Subscription Benefits ───────────────────────────────── */}
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
                    {isPro ? "Unlimited private code storage enabled." : "Max 5 private snippets on FREE tier."}
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

          {/* ── Payment History ─────────────────────────────────────── */}
          <div className="bg-gray-800/80 border border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Payment History</h2>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-500">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm">No payment transactions yet.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-700/60">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-900/60 text-[11px] uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/40">
                      {payments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-700/20 transition-colors">
                          <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${p.plan === "PRO" ? "text-amber-300" : "text-gray-300"}`}>
                              {p.plan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white font-medium">{formatAmount(p.amount)}</td>
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs truncate max-w-[120px]">{p.orderId}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold text-xs ${statusColor[p.status] ?? "text-gray-400"}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>{pagination.total} transaction{pagination.total !== 1 ? "s" : ""}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={pagination.page <= 1}
                        onClick={() => loadHistory(pagination.page - 1)}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Prev
                      </button>
                      <span className="px-3 py-1.5 bg-gray-900/60 rounded-lg">
                        {pagination.page} / {pagination.pages}
                      </span>
                      <button
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => loadHistory(pagination.page + 1)}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          handleUpgradeSuccess();
        }}
      />
    </Layout>
  );
}

export default Subscription;
