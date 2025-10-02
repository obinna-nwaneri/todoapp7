"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = (form.get("email") as string).trim();
    const password = form.get("password") as string;
    setLoading(true);
    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (response?.error) {
      showToast({ type: "error", title: "Login failed", description: response.error });
      return;
    }
    showToast({ type: "success", title: "Welcome back", description: "Redirecting..." });
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;
    if (role === "ADMIN") router.push("/admin-panel/dashboard");
    else if (role === "DOCTOR") router.push("/doctor-panel/dashboard");
    else router.push("/patient-panel/dashboard");
  }

  return (
    <main>
      <h1>Enterprise Doctor Appointment Platform</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div style={{ marginTop: "1rem" }}>
        <div>
          Doctor? <a href="/register-doctor">Register here</a>
        </div>
        <div>
          Patient? <a href="/register-patient">Register here</a>
        </div>
      </div>
    </main>
  );
}
