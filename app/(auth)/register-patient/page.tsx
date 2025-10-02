"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/use-toast";

export default function RegisterPatientPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: (form.get("email") as string).trim(),
      password: form.get("password"),
      name: form.get("name"),
      age: Number(form.get("age")),
      gender: form.get("gender"),
      contactInfo: form.get("contactInfo"),
    };
    setLoading(true);
    const response = await fetch("/api/register/patient", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Registration failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Registration successful", description: "Please sign in." });
    router.push("/login");
  }

  return (
    <main>
      <h1>Patient Registration</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input className="input" id="name" name="name" required />
        </div>
        <div className="form-field">
          <label htmlFor="age">Age</label>
          <input className="input" id="age" name="age" type="number" min="0" required />
        </div>
        <div className="form-field">
          <label htmlFor="gender">Gender</label>
          <input className="input" id="gender" name="gender" required />
        </div>
        <div className="form-field">
          <label htmlFor="contactInfo">Contact information</label>
          <input className="input" id="contactInfo" name="contactInfo" />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" minLength={8} required />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already registered? <a href="/login">Back to login</a>
      </p>
    </main>
  );
}
