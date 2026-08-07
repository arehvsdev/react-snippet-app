import React, { useState } from "react";
import { X, Sparkles, Check, Crown, Loader2 } from "lucide-react";
import { useAuth } from "../../layouts/AuthContext";
import { toast } from "react-hot-toast";
import { openRazorpayCheckout } from "../../services/checkoutService";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {

    if (loading) return;

    try {

      setLoading(true);

      await openRazorpayCheckout({

        user,

        refreshSubscription,

        onSuccess() {

          toast.success("⭐ Welcome to PRO!");

          onClose();

        },

        onFailure(error) {

          console.error(error);

        }

      });

    }
    finally {

      setLoading(false);

    }

  };

  const benefits = [
    { title: "Unlimited Private Snippets", desc: "Store unlimited secure code snippets without restriction" },
    { title: "Premium Themes & Badges", desc: "Unlock sleek gold PRO badge & exclusive custom code themes" },
    { title: "Priority Support (UI Only)", desc: "Get priority response times and dedicated assistance" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden bg-gray-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 text-white">
        {/* Top Glow & Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-gray-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 shadow-md">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Premium Upgrade</span>
              <h2 className="text-2xl font-bold text-white">Upgrade to PRO</h2>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Unlock the full power of Code Snippet Platform for just <span className="text-amber-300 font-semibold">₹199/month</span>.
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Included PRO Benefits</div>
          {benefits.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3.5 p-3 rounded-xl bg-gray-800/60 border border-gray-800 hover:border-amber-500/30 transition-colors">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-200">{item.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 bg-gray-900 border-t border-gray-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-50 transition-all transform active:scale-98 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                Upgrade Now
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="py-3 px-5 rounded-xl font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700/80 transition-colors border border-gray-700 text-center cursor-pointer disabled:opacity-50"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
