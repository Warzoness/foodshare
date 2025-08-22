// middleware.ts (root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/app/(admin)/auth/verifyJWT"; // dùng alias cũng được: "@/lib/auth"

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyJWT(token); // { role, ... }
    const role = payload.role as "ADMIN" | "STAFF" | "USER";
    if (!(role === "ADMIN" || role === "STAFF")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}
