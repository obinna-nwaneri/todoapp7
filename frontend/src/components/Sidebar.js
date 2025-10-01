import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
const navItems = [
    { name: 'My Todos', to: '/' },
    { name: 'Create Todo', to: '/todos/new' },
    { name: 'Profile', to: '/profile' },
];
const Sidebar = () => {
    const { isAdmin } = useAuth();
    return (_jsxs("nav", { className: "space-y-1", children: [navItems.map((item) => (_jsx(NavLink, { to: item.to, end: item.to === '/', className: ({ isActive }) => clsx('block rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-primary-50'), children: item.name }, item.name))), isAdmin && (_jsx(NavLink, { to: "/admin", className: ({ isActive }) => clsx('block rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700 hover:bg-primary-50'), children: "Admin Dashboard" })), isAdmin && (_jsx("a", { href: "/admin", target: "_blank", rel: "noreferrer", className: "block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-primary-50", children: "Open AdminJS" }))] }));
};
export default Sidebar;
