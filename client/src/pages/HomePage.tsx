import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-slate-900 p-6 shadow-lg">
        <h1 className="text-3xl font-bold">Stay organized with TaskFlow</h1>
        <p className="mt-2 text-slate-300">
          Manage tasks, track progress, and stay on top of your priorities with our modern to-do
          manager.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to={isAuthenticated ? "/app" : "/register"}
            className="rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
          >
            {isAuthenticated ? "Open dashboard" : "Get started"}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="rounded-md border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Smart filters",
            description: "Filter by status, priority, or due date to focus on what matters today.",
          },
          {
            title: "Admin insights",
            description: "Track user activity and task metrics with a dedicated admin dashboard.",
          },
          {
            title: "Secure by default",
            description: "JWT authentication, refresh tokens, and password tools keep your data safe.",
          },
        ].map((feature) => (
          <div key={feature.title} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
