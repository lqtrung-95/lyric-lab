import { isEmailConfigured } from "@/lib/email/email-sender";
import { sendStreakEmails } from "@/lib/email/send-streak-emails";
import { isPushConfigured } from "@/lib/push/push-config";
import { sendReminders } from "@/lib/push/send-reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET (Vercel Cron, 20:00 giờ Việt Nam mỗi ngày; xem vercel.json) → nhắc học buổi tối: thông báo đẩy (nếu có khóa VAPID) và email "chuỗi ngày sắp đứt"
 * (nếu đã cấu hình email). Hai kênh chạy độc lập, lỗi một kênh không chặn kênh kia. Chỉ chạy khi đúng `Authorization: Bearer CRON_SECRET`
 * (Vercel tự gắn header này khi có biến CRON_SECRET); thiếu secret, hoặc chưa có kênh nào cấu hình, thì không gửi gì.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  const push = isPushConfigured();
  const email = isEmailConfigured();
  if (!push && !email) return Response.json({ error: "not_configured" }, { status: 503 });
  const [pushResult, emailResult] = await Promise.all([
    push ? sendReminders().catch((error) => { console.error(JSON.stringify({ event: "reminders_error", message: (error as Error)?.message })); return { error: "server_error" }; }) : null,
    email ? sendStreakEmails().catch((error) => { console.error(JSON.stringify({ event: "streak_emails_error", message: (error as Error)?.message })); return { error: "server_error" }; }) : null,
  ]);
  return Response.json({ push: pushResult, email: emailResult });
}
