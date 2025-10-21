import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PublicEndpoint } from "./lib/utils/utils";

const PUBLIC_ENDPOINTS = ["/", "/venue(.*)?", "/sign-in", "/sign-up"]; // this for /venue and its sub-paths
const startWithSign = "/sign";

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the request is for a public endpoint
  const isPublicEndpoint = PublicEndpoint(pathname, PUBLIC_ENDPOINTS);

  // Allow access to public endpoints for unauthenticated users
  if (isPublicEndpoint) return NextResponse.next();

  const session = await getSession(request.headers);
  if (!session?.user && !isPublicEndpoint) {
    return NextResponse.rewrite(new URL("/sign-in", request.url));
  }
  // Redirect to dashboard if authenticated user tries to access sign-in/sign-up pages
  if (session?.user && startWithSign.includes(pathname)) {
    return NextResponse.rewrite(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api/auth|trpc|_vercel|_next/static|_next/image|favicon.ico).*)",
  ],
};
