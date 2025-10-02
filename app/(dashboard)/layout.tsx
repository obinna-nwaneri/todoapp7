import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import SignOutButton from "../../components/sign-out-button";

const navByRole: Record<string, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/admin-panel/dashboard", label: "Dashboard" },
    { href: "/admin-panel/doctors", label: "Doctors" },
    { href: "/admin-panel/patients", label: "Patients" },
    { href: "/admin-panel/appointments", label: "Appointments" },
  ],
  DOCTOR: [
    { href: "/doctor-panel/dashboard", label: "Dashboard" },
    { href: "/doctor-panel/appointments", label: "Appointments" },
  ],
  PATIENT: [
    { href: "/patient-panel/dashboard", label: "Dashboard" },
    { href: "/patient-panel/appointments", label: "Appointments" },
    { href: "/patient-panel/book", label: "Book" },
  ],
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const links = navByRole[session.user.role] ?? [];

  return (
    <div>
      <header style={{ background: "#1e293b", color: "white", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>Enterprise Doctor Platform</strong>
          <div style={{ fontSize: "0.9rem" }}>Signed in as {session.user.email}</div>
        </div>
        <SignOutButton />
      </header>
      <nav style={{ background: "#f8fafc", padding: "0.75rem 1.5rem", display: "flex", gap: "1rem" }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <main>{children}</main>
    </div>
  );
}
