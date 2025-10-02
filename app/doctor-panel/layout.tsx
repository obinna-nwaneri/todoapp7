import { PanelLayout } from "@/components/layout/panel-layout";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function DoctorPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.DOCTOR) {
    redirect("/login");
  }

  return <PanelLayout role="DOCTOR">{children}</PanelLayout>;
}
