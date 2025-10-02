import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

async function getCounts() {
  const responses = await Promise.all([
    fetch("http://localhost:3000/api/patient/appointments?page=1&pageSize=1", { cache: "no-store" }),
    fetch("http://localhost:3000/api/patient/appointments?page=1&pageSize=1&status=APPROVED", { cache: "no-store" }),
  ]);
  const [all, approved] = await Promise.all(responses.map((res) => (res.ok ? res.json() : { total: 0 })));
  return { total: all.total ?? 0, approved: approved.total ?? 0 };
}

export default async function PatientDashboardPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  const stats = await getCounts();

  return (
    <section>
      <h1>Patient Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <h2>Total Appointments</h2>
          <p>{stats.total}</p>
        </div>
        <div className="card">
          <h2>Upcoming Approved</h2>
          <p>{stats.approved}</p>
        </div>
      </div>
    </section>
  );
}
