import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./AuthContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from ?? "/app";

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      alert("Unable to login. Please verify your credentials.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-300">
          Welcome back! Please enter your credentials to access your tasks.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-slate-200">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("username")}
            />
            {errors.username && <p className="mt-1 text-sm text-rose-400">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-slate-300">
        Don't have an account? {" "}
        <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Create one now
        </Link>
      </p>
    </section>
  );
};
