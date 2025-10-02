import { auth } from "./auth";
import { Role } from "@prisma/client";

export async function getCurrentSession() {
  return auth();
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await getCurrentSession();
  if (!session || !session.user || !allowedRoles.includes(session.user.role as Role)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
