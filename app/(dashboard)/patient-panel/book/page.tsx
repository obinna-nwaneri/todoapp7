import PatientBookClient from "../../../../components/patient-book-client";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function PatientBookPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  return <PatientBookClient />;
}
