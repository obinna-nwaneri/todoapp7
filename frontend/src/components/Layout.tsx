import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-xl font-semibold text-primary">
            Enterprise Todo
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-800">{user.full_name}</span>
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs uppercase text-primary">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-dark"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
