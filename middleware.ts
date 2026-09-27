import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.method === "POST") {
    const actionId = request.headers.get("next-action");
    if (actionId && actionId.length < 16) {
      return new NextResponse("Bad Request", { status: 400 });
    }
  }

  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && path !== "/admin/login") {
    const authCookie = request.cookies.get("admin_auth");

    if (!authCookie || authCookie.value !== "true") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
