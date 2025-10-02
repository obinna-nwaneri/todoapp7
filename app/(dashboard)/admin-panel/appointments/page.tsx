import AdminAppointmentsClient from "../../../../components/admin-appointments-client";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function AdminAppointmentsPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <AdminAppointmentsClient />;
}
