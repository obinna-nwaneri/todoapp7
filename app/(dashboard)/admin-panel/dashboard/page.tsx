import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

async function getStats() {
  const response = await fetch("http://localhost:3000/api/admin/stats", { cache: "no-store" });
  if (!response.ok) {
    return { doctors: 0, patients: 0, appointments: 0, pending: 0 };
  }
  return response.json();
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const stats = await getStats();

  return (
    <section>
      <h1>Admin Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <h2>Doctors</h2>
          <p>{stats.doctors}</p>
        </div>
        <div className="card">
          <h2>Patients</h2>
          <p>{stats.patients}</p>
        </div>
        <div className="card">
          <h2>Total Appointments</h2>
          <p>{stats.appointments}</p>
        </div>
        <div className="card">
          <h2>Pending Approvals</h2>
          <p>{stats.pending}</p>
        </div>
      </div>
    </section>
  );
}
