import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">Sign in to Docapp3</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          {loginMutation.isError && (
            <p className="text-sm text-red-600">Invalid credentials. Please try again.</p>
          )}
          <button
            type="submit"
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          New here?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
