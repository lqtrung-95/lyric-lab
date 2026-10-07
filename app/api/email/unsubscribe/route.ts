import { unsubscribeByToken } from "@/lib/email/email-prefs-repo";

export const runtime = "nodejs";

const TOKEN = /^[a-f0-9]{32}$/;

/**
 * POST ?token=… (hoặc form/JSON {token}) → hủy nhận mọi email định kỳ. Dùng cho nút ở trang hủy và cho "hủy một chạm" của ứng dụng thư
 * (header List-Unsubscribe-Post). Chỉ POST: link GET có thể bị trình quét thư tự mở và hủy nhầm.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get("token");
  if (!token) {
    const body = await req.json().catch(() => null) as { token?: unknown } | null;
    token = typeof body?.token === "string" ? body.token : null;
  }
  if (!token || !TOKEN.test(token)) return Response.json({ error: "bad_request" }, { status: 400 });
  return (await unsubscribeByToken(token)) ? Response.json({ ok: true }) : Response.json({ error: "not_found" }, { status: 404 });
}
