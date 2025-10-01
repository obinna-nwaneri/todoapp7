import { NavLink } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, ListTodo, Users, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/todos', label: 'Todos', icon: ListTodo },
  { to: '/app/projects', label: 'Projects', icon: ClipboardList },
];

const adminItems = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/activity', label: 'Activity', icon: Activity },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Enterprise To-Do</h1>
        <p className="text-xs text-slate-500">Stay on top of critical work</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600',
                isActive && 'bg-blue-50 text-blue-600',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <div className="mt-6 space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600',
                    isActive && 'bg-blue-50 text-blue-600',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
      <div className="px-6 py-4 text-xs text-slate-400">v1.0.0</div>
    </aside>
  );
};
