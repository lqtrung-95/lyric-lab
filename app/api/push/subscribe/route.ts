import { getCurrentUser } from "@/lib/auth/current-user";
import { isPushConfigured } from "@/lib/push/push-config";
import { deleteSubscription, saveSubscription } from "@/lib/push/push-subscriptions-repo";

export const runtime = "nodejs";

interface Body { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }

const isHttpsUrl = (v: unknown): v is string => {
  if (typeof v !== "string" || v.length > 2048) return false;
  try { return new URL(v).protocol === "https:"; } catch { return false; }
};
const isKey = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 256;

/** POST {endpoint, keys} (đối tượng PushSubscription.toJSON()) → đăng ký nhận nhắc học cho tài khoản hiện tại (ẩn danh cũng được). */
export async function POST(req: Request) {
  if (!isPushConfigured()) return Response.json({ error: "push_not_configured" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !isHttpsUrl(body.endpoint) || !isKey(body.keys?.p256dh) || !isKey(body.keys?.auth)) return Response.json({ error: "bad_request" }, { status: 400 });
  try {
    await saveSubscription(user.id, { endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}

/** DELETE {endpoint} → tắt nhắc học cho thiết bị đó. */
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (!body || !isHttpsUrl(body.endpoint)) return Response.json({ error: "bad_request" }, { status: 400 });
  await deleteSubscription(user.id, body.endpoint);
  return Response.json({ ok: true });
}
