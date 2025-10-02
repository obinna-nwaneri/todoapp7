import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const roleRouteMap: Record<string, string> = {
  ADMIN: "/admin-panel",
  DOCTOR: "/doctor-panel",
  PATIENT: "/patient-panel"
};

function hasAccess(pathname: string, role?: string | null) {
  if (!role) return false;
  const expectedPrefix = roleRouteMap[role];
  if (!expectedPrefix) return false;
  return pathname.startsWith(expectedPrefix);
}

export default withAuth(
  function middleware(req: NextRequest) {
    const role = req.nextauth.token?.role as string | undefined;
    const { pathname } = req.nextUrl;

    if (!role || !hasAccess(pathname, role)) {
      const redirectTo = role ? roleRouteMap[role] : "/login";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ["/admin-panel/:path*", "/doctor-panel/:path*", "/patient-panel/:path*"]
};
