import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinksByRole = {
  ADMIN: [
    { to: "/admin-panel/dashboard", label: "Dashboard" },
    { to: "/admin-panel/doctors", label: "Doctors" },
    { to: "/admin-panel/patients", label: "Patients" },
    { to: "/admin-panel/appointments", label: "Appointments" },
  ],
  DOCTOR: [
    { to: "/doctor-panel/dashboard", label: "Dashboard" },
    { to: "/doctor-panel/appointments", label: "Appointments" },
  ],
  PATIENT: [
    { to: "/patient-panel/dashboard", label: "Dashboard" },
    { to: "/patient-panel/appointments", label: "My Appointments" },
    { to: "/patient-panel/book", label: "Book" },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const links = navLinksByRole[user?.role] ?? [];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-900 text-white py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Appointment System</h1>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <button
              onClick={logout}
              className="rounded bg-blue-700 px-3 py-1 text-sm hover:bg-blue-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <nav className="w-60 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block rounded bg-white px-4 py-2 shadow hover:bg-blue-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
