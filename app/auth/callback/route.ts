import { NextResponse, after } from "next/server";
import { sendWelcomeIfNeeded } from "@/lib/email/send-welcome";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";

// Chỉ cho chuyển hướng tới đường dẫn nội bộ (chống open redirect).
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/settings");

/**
 * Trang Supabase gọi lại sau khi đăng nhập Google. Đổi mã lấy phiên rồi về trang đích.
 * Thiếu mã hoặc đổi mã lỗi → về Cài đặt kèm `link=error`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");

  if (!code) return NextResponse.redirect(new URL("/settings?link=error", url.origin));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    // Email chào mừng gửi sau khi đã trả phản hồi (không làm chậm đăng nhập, lỗi gửi mail không ảnh hưởng đăng nhập).
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) after(() => sendWelcomeIfNeeded({ id: user.id, email: user.email ?? null, isAnonymous: user.is_anonymous ?? false }));
  }
  return NextResponse.redirect(new URL(error ? "/settings?link=error" : next, url.origin));
}
