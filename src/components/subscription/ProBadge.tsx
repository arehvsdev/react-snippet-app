import React from 'react';
import { Crown } from 'lucide-react';

/**
 * Props for the ProBadge component.
 */
export interface ProBadgeProps {
  /** Size variant of the badge */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Optional custom CSS classes */
  className?: string;
  /** Toggle visibility of the Crown icon */
  showIcon?: boolean;
}

/**
 * Reusable PRO Badge component.
 * Displays a gold/amber badge with a Crown icon indicating active PRO subscription status.
 * Can be reused across Navbar, Profile Page, Dashboard, and Subscription Pages.
 */
export const ProBadge: React.FC<ProBadgeProps> = ({
  size = 'sm',
  className = '',
  showIcon = true,
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={`inline-flex items-center font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Crown className={`${iconSizes[size]} text-amber-400 flex-shrink-0`} />}
      <span>PRO</span>
    </div>
  );
};

export default ProBadge;
