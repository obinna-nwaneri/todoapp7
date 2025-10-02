import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

async function getCounts() {
  const responses = await Promise.all([
    fetch("http://localhost:3000/api/doctor/appointments?page=1&pageSize=1", { cache: "no-store" }),
    fetch("http://localhost:3000/api/doctor/appointments?page=1&pageSize=1&status=PENDING", { cache: "no-store" }),
  ]);
  const [all, pending] = await Promise.all(responses.map((res) => (res.ok ? res.json() : { total: 0 })));
  return { total: all.total ?? 0, pending: pending.total ?? 0 };
}

export default async function DoctorDashboardPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "DOCTOR") {
    redirect("/login");
  }

  const stats = await getCounts();

  return (
    <section>
      <h1>Doctor Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <h2>Total Appointments</h2>
          <p>{stats.total}</p>
        </div>
        <div className="card">
          <h2>Pending Decisions</h2>
          <p>{stats.pending}</p>
        </div>
      </div>
    </section>
  );
}
