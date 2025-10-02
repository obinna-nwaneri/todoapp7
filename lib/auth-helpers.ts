import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireRole(roles: string[]) {
  const session = await getSession();
  if (!session?.user || !roles.includes(session.user.role)) {
    return null;
  }
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundResponse() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
