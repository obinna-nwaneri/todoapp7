import DoctorAppointmentsClient from "../../../../components/doctor-appointments-client";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function DoctorAppointmentsPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "DOCTOR") {
    redirect("/login");
  }

  return <DoctorAppointmentsClient />;
}
