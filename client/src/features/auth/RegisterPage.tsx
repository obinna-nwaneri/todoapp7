import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./AuthContext";

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string().min(8),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values);
      navigate("/app");
    } catch (error) {
      alert("Unable to create account. Please try again.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-1 text-sm text-slate-300">
          Register to start organizing your personal and team tasks.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="register-username" className="block text-sm font-medium text-slate-200">
              Username
            </label>
            <input
              id="register-username"
              type="text"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("username")}
            />
            {errors.username && <p className="mt-1 text-sm text-rose-400">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="register-password2" className="block text-sm font-medium text-slate-200">
              Confirm password
            </label>
            <input
              id="register-password2"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("password2")}
            />
            {errors.password2 && <p className="mt-1 text-sm text-rose-400">{errors.password2.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-slate-300">
        Already have an account? {" "}
        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </section>
  );
};
