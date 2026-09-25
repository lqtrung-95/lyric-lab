import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateMergeToken, hashMergeToken, mergeTokenExpiry } from "./merge-token";

export interface MergePreview {
  knownTerms: number;
  cards: number;
  reviews: number;
}

export class MergeError extends Error {
  constructor(public readonly code: "invalid_token" | "same_account" | "not_anonymous" | "merge_failed") {
    super(code);
    this.name = "MergeError";
  }
}

/** Cấp mã một lần cho tài khoản ẩn danh `fromUser` (gọi trước khi chuyển hướng sang Google). */
export async function createMergeToken(sb: SupabaseClient, fromUser: string, now = new Date()): Promise<string> {
  const token = generateMergeToken();
  await sb.from("account_merge_tokens").delete().eq("from_user", fromUser);
  const { error } = await sb.from("account_merge_tokens").insert({
    token_hash: hashMergeToken(token), from_user: fromUser, expires_at: mergeTokenExpiry(now).toISOString(),
  });
  if (error) throw new Error(`createMergeToken: ${error.message}`);
  return token;
}

async function findFromUser(sb: SupabaseClient, token: string, now: Date): Promise<string> {
  const { data } = await sb.from("account_merge_tokens").select("from_user,expires_at").eq("token_hash", hashMergeToken(token)).maybeSingle();
  if (!data || Date.parse(data.expires_at) <= now.getTime()) throw new MergeError("invalid_token");
  return data.from_user;
}

const count = async (sb: SupabaseClient, table: string, userId: string) =>
  (await sb.from(table).select("*", { count: "exact", head: true }).eq("user_id", userId)).count ?? 0;

/** Số dữ liệu sẽ được gộp, để hiện ở màn xác nhận. */
export async function previewMerge(sb: SupabaseClient, token: string, now = new Date()): Promise<MergePreview> {
  const from = await findFromUser(sb, token, now);
  const [knownTerms, cards, reviews] = await Promise.all([
    count(sb, "user_known_terms", from), count(sb, "user_cards", from), count(sb, "review_logs", from),
  ]);
  return { knownTerms, cards, reviews };
}

/**
 * Gộp dữ liệu ẩn danh (chủ của mã) vào tài khoản `toUser` đang đăng nhập rồi xóa tài khoản ẩn danh.
 * Từ chối khi tài khoản nguồn không còn ẩn danh hoặc trùng đích, để không bao giờ xóa nhầm tài khoản thật.
 */
export async function executeMerge(sb: SupabaseClient, token: string, toUser: string, now = new Date()): Promise<void> {
  const from = await findFromUser(sb, token, now);
  if (from === toUser) throw new MergeError("same_account");
  const { data } = await sb.auth.admin.getUserById(from);
  if (!data.user?.is_anonymous) throw new MergeError("not_anonymous");

  const { error } = await sb.rpc("merge_user_data", { p_from: from, p_to: toUser });
  if (error) throw new MergeError("merge_failed");
  await sb.from("account_merge_tokens").delete().eq("token_hash", hashMergeToken(token));
  await sb.auth.admin.deleteUser(from);
}
