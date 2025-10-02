import AdminDoctorsClient from "../../../../components/admin-doctors-client";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDoctorsPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <AdminDoctorsClient />;
}
