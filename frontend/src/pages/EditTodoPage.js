import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchTodo, updateTodo } from '@/api/todos';
import { fetchUsers } from '@/api/users';
import TodoForm from '@/components/TodoForm';
import { useAuth } from '@/hooks/useAuth';
const EditTodoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const todoQuery = useQuery({
        queryKey: ['todo', id],
        queryFn: () => fetchTodo(Number(id)),
        enabled: Boolean(id),
    });
    const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers, enabled: isAdmin });
    const mutation = useMutation({
        mutationFn: (payload) => updateTodo(Number(id), payload),
        onSuccess: () => {
            toast.success('Todo updated');
            navigate('/');
        },
        onError: () => toast.error('Unable to update todo'),
    });
    if (todoQuery.isLoading) {
        return _jsx("p", { className: "text-sm text-slate-600", children: "Loading todo..." });
    }
    if (!todoQuery.data) {
        return _jsx("p", { className: "text-sm text-rose-600", children: "Todo not found." });
    }
    return (_jsxs("div", { className: "max-w-3xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Edit todo" }), _jsx("p", { className: "text-sm text-slate-600", children: "Update task details and keep collaborators informed." })] }), _jsx(TodoForm, { initialValues: todoQuery.data, onSubmit: (values) => mutation.mutate({
                    title: values.title,
                    description: values.description,
                    dueDate: values.dueDate || undefined,
                    priority: values.priority,
                    status: values.status,
                    userId: values.userId,
                }), submitting: mutation.isPending, users: usersQuery.data, canAssign: isAdmin })] }));
};
export default EditTodoPage;
