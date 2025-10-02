import PatientAppointmentsClient from "../../../../components/patient-appointments-client";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function PatientAppointmentsPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  return <PatientAppointmentsClient />;
}
