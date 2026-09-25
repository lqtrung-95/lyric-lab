import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";

// Chỉ cho chuyển hướng tới đường dẫn nội bộ (chống open redirect).
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/settings");

/**
 * Trang Supabase gọi lại sau khi đăng nhập/liên kết Google. Đổi mã lấy phiên rồi về trang đích.
 * Liên kết thất bại vì Google này đã thuộc tài khoản khác → về Cài đặt kèm `link=exists` để đề nghị đăng nhập và gộp.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const errorCode = url.searchParams.get("error_code");

  if (errorCode === "identity_already_exists") return NextResponse.redirect(new URL("/settings?link=exists", url.origin));
  if (!code) return NextResponse.redirect(new URL("/settings?link=error", url.origin));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(error ? "/settings?link=error" : next, url.origin));
}
