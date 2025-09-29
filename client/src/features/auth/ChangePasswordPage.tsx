import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "./AuthContext";

const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    new_password_confirm: z.string().min(8),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "Passwords do not match",
    path: ["new_password_confirm"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const ChangePasswordPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });
  const { changePassword } = useAuth();

  const onSubmit = async (values: ChangePasswordForm) => {
    try {
      await changePassword(values);
      reset();
      alert("Password updated successfully.");
    } catch (error) {
      alert("Could not change password. Please verify your current password.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-lg space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h1 className="text-2xl font-semibold">Change password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="change-old-password" className="block text-sm font-medium text-slate-200">
              Current password
            </label>
            <input
              id="change-old-password"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("old_password")}
            />
            {errors.old_password && <p className="mt-1 text-sm text-rose-400">{errors.old_password.message}</p>}
          </div>
          <div>
            <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-200">
              New password
            </label>
            <input
              id="change-new-password"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("new_password")}
            />
            {errors.new_password && <p className="mt-1 text-sm text-rose-400">{errors.new_password.message}</p>}
          </div>
          <div>
            <label
              htmlFor="change-confirm-password"
              className="block text-sm font-medium text-slate-200"
            >
              Confirm new password
            </label>
            <input
              id="change-confirm-password"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("new_password_confirm")}
            />
            {errors.new_password_confirm && (
              <p className="mt-1 text-sm text-rose-400">{errors.new_password_confirm.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
          >
            Update password
          </button>
        </form>
      </div>
    </section>
  );
};
