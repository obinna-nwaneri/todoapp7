import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { name: 'My Todos', to: '/' },
  { name: 'Create Todo', to: '/todos/new' },
  { name: 'Profile', to: '/profile' },
]

const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth()
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            clsx(
              'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-primary-50'
            )
          }
        >
          {item.name}
        </NavLink>
      ))}
      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            clsx(
              'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-primary-50'
            )
          }
        >
          Admin Dashboard
        </NavLink>
      )}
      {isAdmin && (
        <a
          href="/admin"
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50"
        >
          Open AdminJS
        </a>
      )}
    </nav>
  )
}

export default Sidebar
