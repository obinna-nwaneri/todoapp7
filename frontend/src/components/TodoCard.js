import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import dayjs from 'dayjs';
import clsx from 'clsx';
const priorityStyles = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-rose-100 text-rose-700',
};
const statusStyles = {
    pending: 'bg-slate-200 text-slate-700',
    in_progress: 'bg-sky-100 text-sky-700',
    completed: 'bg-emerald-100 text-emerald-700',
};
const TodoCard = ({ todo, onEdit, onDelete }) => {
    const due = todo.dueDate ? dayjs(todo.dueDate).format('MMM D, YYYY') : 'No due date';
    return (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: todo.title }), todo.description && _jsx("p", { className: "mt-1 text-sm text-slate-600", children: todo.description })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: clsx('rounded-full px-3 py-1 text-xs font-semibold', priorityStyles[todo.priority]), children: todo.priority.toUpperCase() }), _jsx("span", { className: clsx('rounded-full px-3 py-1 text-xs font-semibold', statusStyles[todo.status]), children: todo.status.replace('_', ' ') })] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-slate-600", children: [_jsxs("span", { children: ["Due: ", due] }), _jsxs("div", { className: "flex gap-3", children: [onEdit && (_jsx("button", { onClick: () => onEdit(todo), className: "text-primary-600 hover:text-primary-700", children: "Edit" })), onDelete && (_jsx("button", { onClick: () => onDelete(todo), className: "text-rose-600 hover:text-rose-700", children: "Delete" }))] })] })] }));
};
export default TodoCard;
