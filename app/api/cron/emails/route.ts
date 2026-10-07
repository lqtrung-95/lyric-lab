import { isEmailConfigured } from "@/lib/email/email-sender";
import { sendDigests } from "@/lib/email/send-digests";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET (Vercel Cron, 09:00 giờ Việt Nam mỗi ngày; xem vercel.json) → gửi tổng kết tuần (thứ Hai) và nhắc quay lại. Chỉ chạy khi đúng
 * `Authorization: Bearer CRON_SECRET`; thiếu secret hoặc chưa cấu hình email thì từ chối, không gửi gì.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!isEmailConfigured()) return Response.json({ error: "email_not_configured" }, { status: 503 });
  try {
    return Response.json(await sendDigests());
  } catch (error) {
    console.error(JSON.stringify({ event: "emails_cron_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
