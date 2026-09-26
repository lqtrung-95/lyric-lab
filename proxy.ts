import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseSessionCookie } from "@/lib/supabase/session-cookie";
import { refreshSupabaseSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  const response = await refreshSupabaseSession(request);

  // Người đã có phiên (đã dùng app hoặc đăng nhập) vào trang giới thiệu thì đưa thẳng vào app. `?landing` để xem lại trang giới thiệu.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && !searchParams.has("landing") && hasSupabaseSessionCookie(request.cookies.getAll())) {
    const redirect = NextResponse.redirect(new URL("/app", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
