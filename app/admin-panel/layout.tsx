import { PanelLayout } from "@/components/layout/panel-layout";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login");
  }

  return <PanelLayout role="ADMIN">{children}</PanelLayout>;
}
