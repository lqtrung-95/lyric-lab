import { z } from "zod";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { insertMessage, isChatBlocked, listMessages, sentSameRecently } from "@/lib/chat/chat-repo";
import { normalizeChatBody, validateChatBody } from "@/lib/chat/validate-chat-message";
import { getProfile } from "@/lib/leaderboard/profile-repo";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: NO_STORE });
const id = (v: string | null) => (v !== null && /^\d{1,15}$/.test(v) ? Number(v) : undefined);

/**
 * GET ?after=<id> | ?before=<id> → tin của cộng đồng (công khai, không cần đăng nhập): {messages, hasMore, deletedIds}.
 * Không có tham số: 50 tin mới nhất. Cho CDN giữ vài giây để nhiều người cùng hỏi chỉ tốn một lượt đọc DB.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  try {
    const data = await listMessages({ after: id(url.searchParams.get("after")), before: id(url.searchParams.get("before")) });
    return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=3, stale-while-revalidate=10" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "chat_list_error", message: (error as Error)?.message }));
    return fail("server_error", 500);
  }
}

const bodySchema = z.object({ body: z.string().max(5000), announcement: z.boolean().optional() });

/**
 * POST {body, announcement?} → gửi tin (cần tài khoản ĐÃ đăng nhập Google, không phải ẩn danh, và có biệt danh). Huy hiệu Admin và quyền gửi thông báo do SERVER quyết theo tài khoản, không theo client.
 * Lỗi: 400 empty/too_long/has_link/inappropriate/spam/duplicate, 401 auth_required, 403 account_required (tài khoản ẩn danh) hoặc blocked, 409 nickname_required, 429 rate_limited, 500 server_error.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("auth_required", 401);
  // Chỉ người đã đăng nhập Google mới nhắn: đọc thì không cần tài khoản, nhưng gắn tin với tài khoản thật giúp chặn người vi phạm có hiệu lực (tài khoản ẩn danh tạo lại không tốn gì).
  if (user.isAnonymous) return fail("account_required", 403);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("empty", 400);
  const isAdmin = isAdminAccount(user.email);
  const body = normalizeChatBody(parsed.data.body);
  const invalid = validateChatBody(body, isAdmin);
  if (invalid) return fail(invalid, 400);

  try {
    if (await isChatBlocked(user.id)) return fail("blocked", 403);
    const profile = await getProfile(user.id);
    if (!profile) return fail("nickname_required", 409);
    if (await sentSameRecently(user.id, body)) return fail("duplicate", 400);
    if (!(await consumeUsage(user, "chat"))) return fail("rate_limited", 429);
    const message = await insertMessage({
      userId: user.id, nickname: profile.nickname, avatarUrl: profile.avatarUrl, isAdmin,
      kind: isAdmin && parsed.data.announcement ? "announcement" : "chat", body,
    });
    return Response.json({ message }, { headers: NO_STORE });
  } catch (error) {
    console.error(JSON.stringify({ event: "chat_send_error", message: (error as Error)?.message }));
    return fail("server_error", 500);
  }
}
