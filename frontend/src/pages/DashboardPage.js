import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchTodos, deleteTodo } from '@/api/todos';
import { fetchUsers } from '@/api/users';
import TodoCard from '@/components/TodoCard';
import DeleteModal from '@/components/DeleteModal';
import { useAuth } from '@/hooks/useAuth';
const DashboardPage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', userId: 'all' });
    const [selected, setSelected] = useState(null);
    const todosQuery = useQuery({
        queryKey: ['todos', filters],
        queryFn: () => fetchTodos({
            status: filters.status !== 'all' ? filters.status : undefined,
            priority: filters.priority !== 'all' ? filters.priority : undefined,
            userId: filters.userId !== 'all' ? Number(filters.userId) : undefined,
        }),
    });
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        enabled: isAdmin,
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => deleteTodo(id),
        onSuccess: () => {
            toast.success('Todo deleted');
            setSelected(null);
            todosQuery.refetch();
        },
        onError: () => toast.error('Unable to delete todo'),
    });
    const summary = useMemo(() => {
        const list = todosQuery.data ?? [];
        return {
            total: list.length,
            completed: list.filter((todo) => todo.status === 'completed').length,
            upcoming: list.filter((todo) => todo.status !== 'completed').length,
        };
    }, [todosQuery.data]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Your Todos" }), _jsx("p", { className: "text-sm text-slate-600", children: "Track progress, adjust priorities, and stay ahead of deadlines." })] }), _jsx("button", { onClick: () => navigate('/todos/new'), className: "inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", children: "Create todo" })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [_jsxs("div", { className: "rounded-xl bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-sm text-slate-500", children: "Total todos" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-slate-900", children: summary.total })] }), _jsxs("div", { className: "rounded-xl bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-sm text-slate-500", children: "Completed" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-emerald-600", children: summary.completed })] }), _jsxs("div", { className: "rounded-xl bg-white p-4 shadow-sm", children: [_jsx("p", { className: "text-sm text-slate-500", children: "In progress" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-sky-600", children: summary.upcoming })] })] }), _jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: _jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (event) => setFilters((prev) => ({ ...prev, status: event.target.value })), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in_progress", children: "In progress" }), _jsx("option", { value: "completed", children: "Completed" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Priority" }), _jsxs("select", { value: filters.priority, onChange: (event) => setFilters((prev) => ({ ...prev, priority: event.target.value })), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), isAdmin && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Owner" }), _jsxs("select", { value: filters.userId, onChange: (event) => setFilters((prev) => ({ ...prev, userId: event.target.value })), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "all", children: "All users" }), usersQuery.data?.map((user) => (_jsx("option", { value: user.id, children: user.name }, user.id)))] })] }))] }) }), todosQuery.isLoading ? (_jsx("p", { className: "text-sm text-slate-600", children: "Loading todos..." })) : todosQuery.data && todosQuery.data.length > 0 ? (_jsx("div", { className: "grid gap-4", children: todosQuery.data.map((todo) => (_jsx(TodoCard, { todo: todo, onEdit: () => navigate(`/todos/${todo.id}/edit`), onDelete: () => setSelected(todo) }, todo.id))) })) : (_jsx("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500", children: "No todos found. Create your first task to get started." })), _jsx(DeleteModal, { open: Boolean(selected), onClose: () => setSelected(null), onConfirm: () => selected && deleteMutation.mutate(selected.id), loading: deleteMutation.isPending, title: "Delete todo", description: `Are you sure you want to delete "${selected?.title}"? This action cannot be undone.` })] }));
};
export default DashboardPage;
