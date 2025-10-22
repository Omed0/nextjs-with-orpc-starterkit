import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const notLetGoIfAuth = ["/sign-in", "/sign-up"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await getSession(request.headers);
  if (!session?.user) {
    return NextResponse.rewrite(new URL("/sign-in", request.url));
  }

  // Redirect to dashboard if authenticated user tries to access sign-in/sign-up pages
  if (session?.user && notLetGoIfAuth.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api/auth|trpc|_vercel|_next/static|_next/image|favicon.ico).+)", // this means all paths except the ones starting with /api/auth, /trpc, /_vercel, /_next/static, /_next/image, favicon.ico
  ],
};
