import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold text-slate-900">
            Enterprise Todo
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : undefined)} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : undefined)} to="/todos">
              My Tasks
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : undefined)} to="/admin/users">
                Admin
              </NavLink>
            )}
            <button
              onClick={logout}
              className="rounded bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
