import Link from "next/link";
import { ReactNode } from "react";

interface PanelLayoutProps {
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  children: ReactNode;
}

const navLinks: Record<PanelLayoutProps["role"], { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/admin-panel/dashboard", label: "Dashboard" },
    { href: "/admin-panel/doctors", label: "Doctors" },
    { href: "/admin-panel/patients", label: "Patients" },
    { href: "/admin-panel/appointments", label: "Appointments" }
  ],
  DOCTOR: [
    { href: "/doctor-panel/dashboard", label: "Dashboard" },
    { href: "/doctor-panel/appointments", label: "Appointments" }
  ],
  PATIENT: [
    { href: "/patient-panel/dashboard", label: "Dashboard" },
    { href: "/patient-panel/appointments", label: "Appointments" },
    { href: "/patient-panel/book", label: "Book" }
  ]
};

export function PanelLayout({ role, children }: PanelLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row">
        <aside className="w-full max-w-xs flex-shrink-0 rounded-lg bg-slate-900 p-6 text-white">
          <h2 className="text-xl font-semibold capitalize">{role.toLowerCase()} panel</h2>
          <nav className="mt-6 space-y-2">
            {navLinks[role].map((link) => (
              <Link key={link.href} href={link.href} className="block rounded px-3 py-2 hover:bg-slate-700">
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 rounded-lg bg-white p-6 shadow">{children}</main>
      </div>
    </div>
  );
}
