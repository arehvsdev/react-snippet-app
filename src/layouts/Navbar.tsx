import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthContext'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Profile', href: '/profile' },
  { name: 'Snippet Feed', href: '/snippet-feed' },
  { name: 'Create Snippet', href: '/create-snippet' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const rightMenu = (() => {
    if (isAuthRoute) return null;
    if (isAuthenticated) {
      return (
        <>
          <button
            type="button"
            className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-6" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="relative ml-3">
            <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <img
                alt={user?.fullName || ''}
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
              />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-900 py-1 outline -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <MenuItem>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                >
                  Your profile
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                >
                  Settings
                </Link>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:outline-hidden"
                >
                  Sign out
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <Link to="/login" className="text-sm text-gray-300 hover:text-white">Login</Link>
        <Link to="/register" className="text-sm text-white bg-blue-600 px-3 py-1 rounded-md">Register</Link>
      </div>
    );
  })();

  return (
    <Disclosure
      as="nav"
      className="relative bg-black after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="SnippetApp"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {isAuthenticated && navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={location.pathname === item.href ? 'page' : undefined}
                    className={classNames(
                      location.pathname === item.href ? 'bg-gray-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {rightMenu}
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {isAuthenticated && navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              aria-current={location.pathname === item.href ? 'page' : undefined}
              className={classNames(
                location.pathname === item.href ? 'bg-gray-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
