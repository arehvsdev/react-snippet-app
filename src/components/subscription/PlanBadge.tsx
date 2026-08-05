import React from "react";
import { Sparkles, Shield } from "lucide-react";

interface PlanBadgeProps {
  plan?: "FREE" | "PRO";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({
  plan = "FREE",
  size = "sm",
  className = "",
  showIcon = true,
}) => {
  const isPro = plan === "PRO";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  if (isPro) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-gray-950 shadow-xs shadow-amber-500/30 border border-yellow-300 ${sizeClasses[size]} ${className}`}
      >
        {showIcon && <Sparkles className={`${iconSizes[size]} fill-current text-gray-950`} />}
        PRO
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-gray-800 text-gray-400 border border-gray-700/80 ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Shield className={`${iconSizes[size]} text-gray-500`} />}
      FREE
    </span>
  );
};

export default PlanBadge;
