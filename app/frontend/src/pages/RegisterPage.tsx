import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { user, registerMutation } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });

  if (user) return <Navigate to="/" replace />;

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    registerMutation.mutate(form);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">Create your Docapp3 account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First name</label>
            <input
              value={form.firstName}
              onChange={handleChange('firstName')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last name</label>
            <input
              value={form.lastName}
              onChange={handleChange('lastName')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          {registerMutation.isError && (
            <p className="text-sm text-red-600">Unable to register. Please check your details.</p>
          )}
          <button
            type="submit"
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
