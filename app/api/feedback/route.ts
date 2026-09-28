import { getCurrentUser } from "@/lib/auth/current-user";
import { feedbackRequestSchema } from "@/lib/feedback/feedback-schema";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

// 10 góp ý/ngày/IP: đủ cho người dùng thật, chặn spam thô.
const limiter = new InMemoryRateLimiter(10, 24 * 60 * 60 * 1000);

/** POST {category, message, pageUrl?} → lưu góp ý/báo lỗi từ trang Cài đặt. Gắn user_id nếu đã có phiên (kể cả ẩn danh). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const parsed = feedbackRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const user = await getCurrentUser();
  const { error } = await createSupabaseServiceClient().from("feedback").insert({
    user_id: user?.id ?? null, category: parsed.data.category, message: parsed.data.message, page_url: parsed.data.pageUrl ?? null,
  });
  if (error) {
    console.error(JSON.stringify({ event: "feedback_error", message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
