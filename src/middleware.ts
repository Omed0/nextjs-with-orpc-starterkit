import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ENDPOINT = ["/dashboard(.*)?", "/todos(.*)?"]; // this for /dashboard and its sub-paths

export default async function middleware(request: NextRequest) {
  const session = await getSession(request.headers);
  if (
    !session?.user &&
    PROTECTED_ENDPOINT.some((endpoint) =>
      request.nextUrl.pathname.match(endpoint)
    )
  ) {
    return NextResponse.rewrite(new URL("/sign-in", request.url));
  }

  if (session?.user && request.nextUrl.pathname.includes("/sign-")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api/auth|trpc|_vercel|_next/static|_next/image|favicon.ico).*)",
  ],
};
