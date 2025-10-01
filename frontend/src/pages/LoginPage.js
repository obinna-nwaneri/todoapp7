import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { login } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuthState } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const mutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            const token = data.token.token ?? '';
            setAuthState({ user: data.user, token });
            toast.success('Welcome back!');
            const redirectTo = location.state?.from?.pathname ?? '/';
            navigate(redirectTo, { replace: true });
        },
        onError: () => {
            toast.error('Unable to sign in. Check your credentials.');
        },
    });
    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate({ email: form.email, password: form.password });
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-slate-100 px-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-8 shadow-lg", children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Sign in" }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Access your tasks and stay on top of priorities." }), _jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Email" }), _jsx("input", { type: "email", name: "email", autoComplete: "email", required: true, value: form.email, onChange: handleChange, className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Password" }), _jsx("input", { type: "password", name: "password", autoComplete: "current-password", required: true, value: form.password, onChange: handleChange, className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsx("button", { type: "submit", disabled: mutation.isPending, className: "w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70", children: mutation.isPending ? 'Signing in...' : 'Sign in' })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-slate-600", children: ["Need an account?", ' ', _jsx(Link, { to: "/register", className: "font-medium text-primary-600 hover:text-primary-700", children: "Register now" })] })] }) }));
};
export default LoginPage;
