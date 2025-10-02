import AdminPatientsClient from "../../../../components/admin-patients-client";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPatientsPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <AdminPatientsClient />;
}
