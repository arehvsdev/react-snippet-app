import { useState, useEffect, useRef } from 'react';
import { Menu as MenuIcon, X as XIcon, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { ProBadge } from '../components/subscription/ProBadge';
import { getAvatarUrl } from '../utils/avatar';

/**
 * Navigation item structure.
 */
interface NavItem {
  name: string;
  href: string;
}

/**
 * Main navigation routes configuration.
 */
const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Profile', href: '/profile' },
  { name: 'Snippet Feed', href: '/snippet-feed' },
  { name: 'Create Snippet', href: '/create-snippet' },
  { name: 'Subscription', href: '/subscription' },
];

/**
 * Utility function to combine Tailwind CSS class names conditionally.
 */
function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Main application Navigation Bar component.
 * Uses native React state and Tailwind CSS (no external Headless UI library needed).
 */
export default function Navbar() {
  const { isAuthenticated, logout, user, refreshSubscription } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize live subscription status on component mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Triggers user sign-out workflow with feedback toast.
   */
  const handleLogout = (): void => {
    try {
      logout();
      toast.success('Logged out successfully!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
    }
  };

  /**
   * Checks if a navigation item is currently active based on pathname.
   */
  const isCurrentPath = (path: string): boolean => location.pathname === path;

  /**
   * Renders navigation links for desktop or mobile views.
   */
  const renderNavLinks = (isMobile = false) => {
    if (!isAuthenticated) return null;

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const itemsToRender = isAdmin
      ? [
          { name: 'Dashboard', href: '/admin/dashboard' },
          ...NAVIGATION_ITEMS.filter((item) => item.href !== '/subscription' && item.href !== '/pricing')
        ]
      : NAVIGATION_ITEMS;

    return itemsToRender.map((item) => {
      const active = isCurrentPath(item.href);
      const className = classNames(
        active
          ? 'bg-gray-950/50 text-white'
          : 'text-gray-300 hover:bg-white/5 hover:text-white',
        isMobile
          ? 'block rounded-md px-3 py-2 text-base font-medium'
          : 'rounded-md px-3 py-2 text-sm font-medium'
      );

      return (
        <Link
          key={item.name}
          to={item.href}
          aria-current={active ? 'page' : undefined}
          className={className}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {item.name}
        </Link>
      );
    });
  };

  /**
   * Renders the authenticated user profile menu dropdown.
   */
  const renderProfileDropdown = () => {
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isPro = user?.plan === 'PRO';
    const displayName = user?.fullName || user?.username || 'User';
    const email = user?.email || '';

    return (
      <div className="relative ml-3" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="relative flex items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
        >
          <span className="sr-only">Open user menu</span>
          {isPro && !isAdmin && <ProBadge size="xs" className="mr-2" />}
          <img
            alt={displayName}
            src={getAvatarUrl((user as any)?.avatar, displayName)}
            className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
          />
        </button>

        {isProfileMenuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-900 py-1 outline -outline-offset-1 outline-white/10 shadow-xl">
            {/* Header containing Name, Email, and Plan Badge */}
            <div className="border-b border-gray-800 px-4 py-3">
              <div className="text-sm font-semibold text-white truncate">{displayName}</div>
              <div className="mt-0.5 text-xs text-gray-400 truncate">{email}</div>
              {!isAdmin && (
                <div className="mt-2">
                  {isPro ? (
                    <ProBadge size="xs" />
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-300">
                      FREE
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Dropdown Navigation Actions */}
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Profile
            </Link>
            {!isAdmin && (
              <Link
                to="/subscription"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Subscription
              </Link>
            )}
            <Link
              to="/settings"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders the right-hand action area (Notifications, User Profile, or Auth Links).
   */
  const renderRightActions = () => {
    if (isAuthRoute) return null;

    if (isAuthenticated) {
      return (
        <div className="flex items-center space-x-2">
          {/* Notifications Icon Button */}
          <button
            type="button"
            className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 cursor-pointer"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="w-6 h-6" />
          </button>

          {/* Profile Menu Dropdown */}
          {renderProfileDropdown()}
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white">
          Login
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md transition-colors"
        >
          Register
        </Link>
      </div>
    );
  };

  return (
    <nav className="relative bg-black after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500 cursor-pointer"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XIcon className="block w-6 h-6" />
              ) : (
                <MenuIcon className="block w-6 h-6" />
              )}
            </button>
          </div>

          {/* Platform Branding & Desktop Navigation Links */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="flex shrink-0 items-center">
              <img
                alt="SnippetApp"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">{renderNavLinks(false)}</div>
            </div>
          </div>

          {/* Right Action Bar (Notifications / Profile Menu / Auth Buttons) */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {renderRightActions()}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer Panel */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">{renderNavLinks(true)}</div>
        </div>
      )}
    </nav>
  );
}
