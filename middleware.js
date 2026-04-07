import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(req) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value; },
        set(name, value, options) { req.cookies.set({ name, value, ...options }); res = NextResponse.next({ request: { headers: req.headers } }); res.cookies.set({ name, value, ...options }); },
        remove(name, options) { req.cookies.set({ name, value: "", ...options }); res = NextResponse.next({ request: { headers: req.headers } }); res.cookies.set({ name, value: "", ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  if (req.nextUrl.pathname.startsWith("/app") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login/signup
  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
