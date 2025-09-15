import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // 1️⃣ Block Python requests bots
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.includes("python-requests")) {
    return new Response("Forbidden", { status: 403 });
  }

  // 2️⃣ Protect admin API routes
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Optional: if you had roles, you could check token.role === 'ADMIN'
  }
}

export const config = {
  matcher: [
    "/(.*)", // all routes
  ],
};
