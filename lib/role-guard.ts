import { Role } from "@prisma/client";
import { auth } from "./auth";

export async function ensureRole(role: Role | Role[]) {
  const session = await auth();
  const roles = Array.isArray(role) ? role : [role];
  if (!session?.user || !roles.includes(session.user.role as Role)) {
    return null;
  }
  return session.user;
}
