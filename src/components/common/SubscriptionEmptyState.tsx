import React from "react";
import { Sparkles, Crown, Bookmark, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../layouts/AuthContext";

interface EmptyStateProps {
  type: "subscription" | "pricing" | "bookmarks";
  onAction?: () => void;
}

/**
 * Subscription Empty State Banner Component.
 * Displays upgrade options for FREE users, and automatically hides upgrade banners for PRO members.
 */
export const SubscriptionEmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isPro = user?.plan === "PRO";

  // Hide upgrade banner completely for PRO plan members
  if (isPro && type === "bookmarks") {
    return null;
  }

  if (type === "subscription") {
    return (
      <div className="bg-gray-800/80 border border-gray-700/80 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center mx-auto text-gray-400">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No Subscription Found</h3>
          <p className="text-xs text-gray-400 mt-1">You are currently on the Free Developer tier.</p>
        </div>
        {!isPro && (
          <button
            onClick={onAction || (() => navigate("/pricing"))}
            className="py-2.5 px-5 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Explore Plans
          </button>
        )}
      </div>
    );
  }

  if (type === "pricing") {
    return (
      <div className="bg-gray-800/80 border border-gray-700/80 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center mx-auto text-amber-400">
          <Crown className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No Plans Available</h3>
          <p className="text-xs text-gray-400 mt-1">Please check back later for new promotional tiers.</p>
        </div>
      </div>
    );
  }

  // Bookmarks empty state upgrade notice for FREE users
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3 my-6">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
        <Bookmark className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">Upgrade to unlock unlimited bookmarks</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Free tier includes up to 3 saved bookmarks. PRO members enjoy unlimited bookmark storage.
        </p>
      </div>
      <button
        onClick={onAction || (() => navigate("/pricing"))}
        className="py-2 px-4 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 fill-current" /> Upgrade to PRO
      </button>
    </div>
  );
};

export default SubscriptionEmptyState;
