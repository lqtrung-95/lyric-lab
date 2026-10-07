import { getCurrentUser } from "@/lib/auth/current-user";
import { ensurePrefs, updatePrefs } from "@/lib/email/email-prefs-repo";
import { isEmailConfigured } from "@/lib/email/email-sender";

export const runtime = "nodejs";

/** GET → tùy chọn email của tài khoản hiện tại (chỉ tài khoản có email thật; `configured: false` khi server chưa bật email). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (!isEmailConfigured() || user.isAnonymous || !user.email) return Response.json({ configured: false });
  const p = await ensurePrefs(user.id);
  return Response.json({ configured: true, weeklyEnabled: p.weeklyEnabled, reminderEnabled: p.reminderEnabled }, { headers: { "Cache-Control": "private, no-store" } });
}

/** PATCH {weeklyEnabled?, reminderEnabled?} → đổi tùy chọn email. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (user.isAnonymous || !user.email) return Response.json({ error: "email_required" }, { status: 409 });
  const body = (await req.json().catch(() => null)) as { weeklyEnabled?: unknown; reminderEnabled?: unknown } | null;
  const change = {
    weeklyEnabled: typeof body?.weeklyEnabled === "boolean" ? body.weeklyEnabled : undefined,
    reminderEnabled: typeof body?.reminderEnabled === "boolean" ? body.reminderEnabled : undefined,
  };
  if (change.weeklyEnabled === undefined && change.reminderEnabled === undefined) return Response.json({ error: "bad_request" }, { status: 400 });
  const p = await updatePrefs(user.id, change);
  return Response.json({ configured: true, weeklyEnabled: p.weeklyEnabled, reminderEnabled: p.reminderEnabled });
}
