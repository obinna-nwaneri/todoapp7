import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateProfile } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
const ProfilePage = () => {
    const { user, setAuthState, token } = useAuth();
    const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success('Profile updated');
            setAuthState({ user: data, token: token ?? null });
            setForm((prev) => ({ ...prev, password: '' }));
        },
        onError: () => toast.error('Unable to update profile'),
    });
    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate({
            name: form.name,
            email: form.email,
            password: form.password ? form.password : undefined,
        });
    };
    return (_jsxs("div", { className: "max-w-2xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Profile" }), _jsx("p", { className: "text-sm text-slate-600", children: "Update account details and keep your contact information current." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Full name" }), _jsx("input", { type: "text", name: "name", required: true, value: form.name, onChange: handleChange, className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Email" }), _jsx("input", { type: "email", name: "email", required: true, value: form.email, onChange: handleChange, className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Password" }), _jsx("input", { type: "password", name: "password", value: form.password, onChange: handleChange, placeholder: "Leave blank to keep current password", className: "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" })] }), _jsx("button", { type: "submit", disabled: mutation.isPending, className: "rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70", children: mutation.isPending ? 'Updating...' : 'Save changes' })] })] }));
};
export default ProfilePage;
