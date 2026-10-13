import { getCurrentUser } from "@/lib/auth/current-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → {registered}: người xem đã đăng nhập Google (không phải ẩn danh) thì nhắn tin được. Chưa có phiên cũng trả false (không lỗi). */
export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ registered: !!user && !user.isAnonymous }, { headers: { "Cache-Control": "private, no-store" } });
}
