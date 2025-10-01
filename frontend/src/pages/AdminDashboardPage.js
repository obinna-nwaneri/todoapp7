import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchUsers, updateUser } from '@/api/users';
import { fetchTodos } from '@/api/todos';
import TodoCard from '@/components/TodoCard';
const AdminDashboardPage = () => {
    const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
    const todosQuery = useQuery({ queryKey: ['todos', { scope: 'admin' }], queryFn: () => fetchTodos() });
    const [editingUserId, setEditingUserId] = useState(null);
    const updateMutation = useMutation({
        mutationFn: ({ id, role }) => updateUser(id, { role }),
        onSuccess: () => {
            toast.success('User updated');
            usersQuery.refetch();
            setEditingUserId(null);
        },
        onError: () => toast.error('Unable to update user'),
    });
    const stats = useMemo(() => {
        const todos = todosQuery.data ?? [];
        return {
            totalTodos: todos.length,
            overdue: todos.filter((todo) => todo.status !== 'completed' && todo.dueDate && new Date(todo.dueDate) < new Date()).length,
            highPriority: todos.filter((todo) => todo.priority === 'high').length,
        };
    }, [todosQuery.data]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Admin overview" }), _jsx("p", { className: "text-sm text-slate-600", children: "Manage team members, audit tasks, and access AdminJS for advanced controls." }), _jsx("a", { href: "/admin", target: "_blank", rel: "noreferrer", className: "mt-3 inline-flex items-center rounded-lg border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50", children: "Open AdminJS panel" })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [_jsxs("div", { className: "rounded-xl bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-sm text-slate-500", children: "Total users" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-slate-900", children: usersQuery.data?.length ?? 0 })] }), _jsxs("div", { className: "rounded-xl bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-sm text-slate-500", children: "High priority todos" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-rose-600", children: stats.highPriority })] }), _jsxs("div", { className: "rounded-xl bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-sm text-slate-500", children: "At risk of delay" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-amber-600", children: stats.overdue })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Team members" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Promote users to administrators or adjust access levels." }), _jsx("div", { className: "mt-4 overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-slate-200 text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 font-medium text-slate-600", children: "Name" }), _jsx("th", { className: "px-4 py-2 font-medium text-slate-600", children: "Email" }), _jsx("th", { className: "px-4 py-2 font-medium text-slate-600", children: "Role" }), _jsx("th", { className: "px-4 py-2" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-200 bg-white", children: usersQuery.data?.map((user) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-2 text-slate-800", children: user.name }), _jsx("td", { className: "px-4 py-2 text-slate-600", children: user.email }), _jsx("td", { className: "px-4 py-2", children: _jsxs("select", { value: user.role, onChange: (event) => {
                                                        setEditingUserId(user.id);
                                                        updateMutation.mutate({ id: user.id, role: event.target.value });
                                                    }, className: "rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "admin", children: "Admin" })] }) }), _jsx("td", { className: "px-4 py-2 text-right text-xs text-slate-500", children: editingUserId === user.id && updateMutation.isPending ? 'Saving...' : '' })] }, user.id))) })] }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "All todos" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Monitor high-impact work across the organisation." }), todosQuery.isLoading ? (_jsx("p", { className: "mt-4 text-sm text-slate-600", children: "Loading todos..." })) : todosQuery.data && todosQuery.data.length > 0 ? (_jsx("div", { className: "mt-4 grid gap-4", children: todosQuery.data.slice(0, 6).map((todo) => (_jsx(TodoCard, { todo: todo }, todo.id))) })) : (_jsx("p", { className: "mt-4 text-sm text-slate-600", children: "No todos available." }))] })] }));
};
export default AdminDashboardPage;
