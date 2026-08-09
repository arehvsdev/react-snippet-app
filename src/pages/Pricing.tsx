import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Check, X, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Crown, Loader2 } from "lucide-react";
import { useAuth } from "../layouts/AuthContext";
import { PlanBadge } from "../components/subscription/PlanBadge";
import { toast } from "react-hot-toast";
import { openRazorpayCheckout } from "../services/checkoutService";

/**
 * Pricing Page Component.
 * Displays tier features, pricing comparison, FAQ accordion, and triggers Razorpay PRO checkout.
 */
export function Pricing() {
  const { user, setPlan, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  const isPro = user?.plan === "PRO";

  const faqs = [
    {
      question: "What is PRO?",
      answer: "PRO is our premium tier designed for power developers. It unlocks unlimited private code snippets, unlimited snippet storage, exclusive gold profile badges, custom themes, and priority support.",
    },
    {
      question: "Is this a real payment?",
      answer: "No, this is a test mode experience. Clicking 'Upgrade to PRO' creates a test mode order with Razorpay sandbox.",
    },
    {
      question: "Can I upgrade or view subscription status later?",
      answer: "Yes, you can check your membership status and payment history anytime from the Subscription page.",
    },
  ];

  /**
   * Triggers Razorpay payment checkout workflow.
   */
  const handleUpgradeToPro = async () => {
    if (isPro || loading) return;

    try {
      setLoading(true);
      await openRazorpayCheckout({
        user,
        refreshSubscription,
        onSuccess() {
          toast.success("🎉 PRO Membership Activated");
          navigate("/subscription");
        },
        onFailure(error) {
          console.error("Upgrade error:", error);
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              PRO unlocks premium features, unlimited private snippets, and exclusive profile badges.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* FREE Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-white">FREE</h3>
                  <PlanBadge plan="FREE" size="md" />
                </div>
                <p className="text-xs text-gray-400 mb-6">Basic plan for developers getting started.</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">₹0</span>
                    <span className="text-gray-400 text-sm">/ forever</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-300 mb-8 border-t border-gray-700/60 pt-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Up to 3 Snippets</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-500">
                    <X className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>Public Snippets Only</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Community Bookmarks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Search Engine</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Community Comments</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => isPro && setPlan("FREE")}
                disabled={!isPro}
                className={`w-full py-3 px-5 rounded-xl font-semibold text-sm transition-colors ${
                  !isPro
                    ? "bg-gray-700/60 text-gray-400 cursor-not-allowed border border-gray-600/40"
                    : "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 cursor-pointer"
                }`}
              >
                {!isPro ? "Current Plan" : "Downgrade Disabled"}
              </button>
            </div>

            {/* PRO Card */}
            <div className="bg-gray-800 border-2 border-blue-500/80 rounded-2xl p-8 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-current" /> ⭐ Most Popular
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <h3 className="text-2xl font-bold text-white">PRO</h3>
                  <PlanBadge plan="PRO" size="md" />
                </div>
                <p className="text-xs text-gray-400 mb-6">For professional developers who need full flexibility.</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">₹199</span>
                    <span className="text-gray-400 text-sm">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-200 mb-8 border-t border-gray-700/60 pt-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold text-white">Unlimited Private &amp; Public Snippets</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Unlimited Bookmarks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Gold PRO Badge</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Premium Themes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleUpgradeToPro}
                disabled={isPro || loading}
                className={`w-full py-3 px-5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                  isPro
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/40 cursor-default"
                    : loading
                    ? "bg-blue-600/70 text-white cursor-wait opacity-80"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
                }`}
              >
                {isPro ? (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Active Plan
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Upgrade to PRO"
                )}
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900/50"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between font-semibold text-white hover:text-blue-400 transition-colors text-sm sm:text-base cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-gray-700/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Pricing;
