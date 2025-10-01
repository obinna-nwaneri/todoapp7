import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const defaultValues = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
};
const TodoForm = ({ initialValues, onSubmit, submitting, users, canAssign }) => {
    const [values, setValues] = useState(defaultValues);
    useEffect(() => {
        if (initialValues) {
            setValues({
                title: initialValues.title ?? '',
                description: initialValues.description ?? '',
                dueDate: initialValues.dueDate ?? '',
                priority: initialValues.priority ?? 'medium',
                status: initialValues.status ?? 'pending',
                userId: initialValues.userId,
            });
        }
    }, [initialValues]);
    const handleChange = (field) => (event) => {
        const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(values);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Title" }), _jsx("input", { type: "text", required: true, value: values.title, onChange: handleChange('title'), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Description" }), _jsx("textarea", { rows: 3, value: values.description, onChange: handleChange('description'), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Due date" }), _jsx("input", { type: "date", value: values.dueDate, onChange: handleChange('dueDate'), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Priority" }), _jsxs("select", { value: values.priority, onChange: handleChange('priority'), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Status" }), _jsxs("select", { value: values.status, onChange: handleChange('status'), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in_progress", children: "In Progress" }), _jsx("option", { value: "completed", children: "Completed" })] })] })] }), canAssign && users && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Assign to user" }), _jsxs("select", { value: values.userId ?? '', onChange: handleChange('userId'), className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500", children: [_jsx("option", { value: "", children: "Select user" }), users.map((user) => (_jsxs("option", { value: user.id, children: [user.name, " (", user.email, ")"] }, user.id)))] })] })), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: submitting, className: "inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70", children: submitting ? 'Saving...' : 'Save Todo' }) })] }));
};
export default TodoForm;
