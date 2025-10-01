import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
  { name: 'Dashboard', to: '/' },
  { name: 'New Todo', to: '/todos/new' },
  { name: 'Profile', to: '/profile' },
]

const adminNavigation = [{ name: 'Admin', to: '/admin' }]

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth()

  const links = isAdmin ? [...navigation, ...adminNavigation] : navigation

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-slate-200">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="text-lg font-semibold text-primary-600">
                  Enterprise Todo
                </Link>
                <div className="hidden md:block ml-8">
                  <div className="flex items-baseline space-x-4">
                    {links.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                          clsx(
                            'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50'
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                    {isAdmin && (
                      <a
                        href="/admin"
                        className="px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-primary-700 hover:bg-primary-50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        AdminJS
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400">
                      <span>{user?.name}</span>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={clsx(
                              active ? 'bg-slate-100' : '',
                              'block px-4 py-2 text-sm text-slate-700'
                            )}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={clsx(
                              active ? 'bg-slate-100' : '',
                              'block w-full px-4 py-2 text-left text-sm text-slate-700'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {links.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={NavLink}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )
                  }
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {isAdmin && (
                <a
                  href="/admin"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                >
                  AdminJS
                </a>
              )}
              <button
                onClick={logout}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700"
              >
                Sign out
              </button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Navbar
