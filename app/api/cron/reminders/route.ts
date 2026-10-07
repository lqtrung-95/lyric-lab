import { isPushConfigured } from "@/lib/push/push-config";
import { sendReminders } from "@/lib/push/send-reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET (Vercel Cron, 20:00 giờ Việt Nam mỗi ngày; xem vercel.json) → gửi nhắc học. Chỉ chạy khi đúng `Authorization: Bearer CRON_SECRET`
 * (Vercel tự gắn header này khi có biến CRON_SECRET); thiếu secret hoặc khóa VAPID thì từ chối, không gửi gì.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isPushConfigured()) return Response.json({ error: "push_not_configured" }, { status: 503 });
  try {
    return Response.json(await sendReminders());
  } catch (error) {
    console.error(JSON.stringify({ event: "reminders_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
