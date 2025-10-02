import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Enterprise Doctor&apos;s Appointment Application</h1>
      <p className="text-slate-600">
        A role-based scheduling experience tailored for administrators, doctors, and patients. Use the links below to
        authenticate or explore the panels.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin-panel/dashboard" className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
          <p className="text-sm text-slate-600">Manage doctors, patients, and appointments.</p>
        </Link>
        <Link href="/doctor-panel/dashboard" className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Doctor Panel</h2>
          <p className="text-sm text-slate-600">Track upcoming appointments and update availability.</p>
        </Link>
        <Link href="/patient-panel/dashboard" className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Patient Panel</h2>
          <p className="text-sm text-slate-600">Book appointments and manage your care journey.</p>
        </Link>
      </div>
    </section>
  );
}
