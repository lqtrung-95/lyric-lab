import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { ChatMessage, ChatStatus } from "./chat-types";

interface Row {
  id: number;
  nickname: string;
  avatar_url: string | null;
  is_admin: boolean;
  kind: "chat" | "announcement";
  body: string;
  created_at: string;
}

const COLUMNS = "id,nickname,avatar_url,is_admin,kind,body,created_at";
export const PAGE_SIZE = 50;
const MAX_NEW = 100;
/** Tin bị xóa trong khoảng này được báo cho người đang mở trang để họ gỡ khỏi màn hình. */
const DELETED_WINDOW_MS = 15 * 60_000;
/** Cùng một người gửi đúng nội dung này trong khoảng này thì coi là gửi trùng. */
const DUPLICATE_WINDOW_MS = 60_000;

const toMessage = (r: Row): ChatMessage => ({ id: r.id, nickname: r.nickname, avatarUrl: r.avatar_url, isAdmin: r.is_admin, kind: r.kind, body: r.body, createdAt: r.created_at });

/**
 * Tin của cộng đồng, cũ → mới. `after`: các tin mới hơn id đó (để hỏi tin mới định kỳ). `before`: trang tin cũ hơn id đó. Không có cả hai: trang mới nhất.
 * Kèm id các tin vừa bị xóa gần đây để người đang xem gỡ chúng.
 */
export async function listMessages(opts: { after?: number; before?: number }): Promise<{ messages: ChatMessage[]; hasMore: boolean; deletedIds: number[] }> {
  const sb = createSupabaseServiceClient();
  const deletedSince = new Date(Date.now() - DELETED_WINDOW_MS).toISOString();
  const deletedPromise = sb.from("chat_messages").select("id").gte("deleted_at", deletedSince).limit(200);

  let messages: ChatMessage[];
  let hasMore = false;
  if (opts.after !== undefined) {
    const { data, error } = await sb.from("chat_messages").select(COLUMNS).is("deleted_at", null).gt("id", opts.after).order("id", { ascending: true }).limit(MAX_NEW);
    if (error) throw new Error(`listMessages: ${error.message}`);
    messages = ((data ?? []) as Row[]).map(toMessage);
  } else {
    let q = sb.from("chat_messages").select(COLUMNS).is("deleted_at", null).order("id", { ascending: false }).limit(PAGE_SIZE + 1);
    if (opts.before !== undefined) q = q.lt("id", opts.before);
    const { data, error } = await q;
    if (error) throw new Error(`listMessages: ${error.message}`);
    const rows = (data ?? []) as Row[];
    hasMore = rows.length > PAGE_SIZE;
    messages = rows.slice(0, PAGE_SIZE).reverse().map(toMessage);
  }
  const { data: deleted } = await deletedPromise;
  return { messages, hasMore, deletedIds: ((deleted ?? []) as { id: number }[]).map((d) => d.id) };
}

/** Id tin mới nhất và thông báo mới nhất của quản trị (để chấm "có tin mới" và banner). */
export async function getChatStatus(): Promise<ChatStatus> {
  const sb = createSupabaseServiceClient();
  const [latest, announcement] = await Promise.all([
    sb.from("chat_messages").select("id").is("deleted_at", null).order("id", { ascending: false }).limit(1).maybeSingle(),
    sb.from("chat_messages").select("id,nickname,body,created_at").is("deleted_at", null).eq("kind", "announcement").order("id", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const a = announcement.data as { id: number; nickname: string; body: string; created_at: string } | null;
  return { latestId: (latest.data as { id: number } | null)?.id ?? 0, announcement: a ? { id: a.id, nickname: a.nickname, body: a.body, createdAt: a.created_at } : null };
}

export async function isChatBlocked(userId: string): Promise<boolean> {
  const { data } = await createSupabaseServiceClient().from("chat_blocked_users").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

/** Người này vừa gửi đúng nội dung này chưa. */
export async function sentSameRecently(userId: string, body: string): Promise<boolean> {
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const { data } = await createSupabaseServiceClient().from("chat_messages").select("id").eq("user_id", userId).eq("body", body).gte("created_at", since).is("deleted_at", null).limit(1);
  return (data ?? []).length > 0;
}

export async function insertMessage(input: { userId: string; nickname: string; avatarUrl: string | null; isAdmin: boolean; kind: "chat" | "announcement"; body: string }): Promise<ChatMessage> {
  const { data, error } = await createSupabaseServiceClient().from("chat_messages")
    .insert({ user_id: input.userId, nickname: input.nickname, avatar_url: input.avatarUrl, is_admin: input.isAdmin, kind: input.kind, body: input.body }).select(COLUMNS).single();
  if (error || !data) throw new Error(`insertMessage: ${error?.message ?? "không có dữ liệu"}`);
  return toMessage(data as Row);
}

/** Quản trị xóa mềm một tin; `block` thì chặn luôn người gửi (tin của quản trị viên không bị chặn). */
export async function deleteMessage(id: number, block: boolean): Promise<"ok" | "not_found"> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("chat_messages").update({ deleted_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null).select("user_id,is_admin").maybeSingle();
  if (error) throw new Error(`deleteMessage: ${error.message}`);
  if (!data) return "not_found";
  const row = data as { user_id: string; is_admin: boolean };
  if (block && !row.is_admin) {
    const { error: blockError } = await sb.from("chat_blocked_users").upsert({ user_id: row.user_id });
    if (blockError) throw new Error(`deleteMessage (chặn): ${blockError.message}`);
  }
  return "ok";
}
