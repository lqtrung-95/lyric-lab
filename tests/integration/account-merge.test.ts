import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Gộp tài khoản ẩn danh vào tài khoản đã đăng nhập, và xóa dữ liệu, trên Supabase thật.
// Cần đã chạy migration account_merge_tokens và bật Anonymous sign-ins. Tự bỏ qua khi thiếu biến môi trường.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

describe.skipIf(!enabled)("gộp tài khoản và xóa dữ liệu", () => {
  let service: SupabaseClient;
  let anonId = "";
  let memberId = "";
  const created: string[] = [];

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, opts);
    const anon = createClient(url!, anonKey!, opts);
    const { data, error } = await anon.auth.signInAnonymously();
    if (error || !data.user) throw new Error(`signInAnonymously: ${error?.message}`);
    anonId = data.user.id;
    const member = await service.auth.admin.createUser({ email: `merge-test-${Date.now()}@example.test`, email_confirm: true });
    memberId = member.data.user!.id;
    created.push(anonId, memberId);
    await service.from("user_cards").insert({ user_id: anonId, item_key: "vocab:词", kind: "vocab", term: "词", meaning: "từ", reps: 3 });
    await service.from("user_known_terms").insert({ user_id: anonId, item_key: "vocab:好" });
  });

  afterAll(async () => {
    for (const id of created) await service.auth.admin.deleteUser(id);
  });

  it("mã chỉ dùng được đúng: xem trước đếm đúng, mã lạ và mã hết hạn bị từ chối", async () => {
    const { createMergeToken, previewMerge } = await import("@/lib/account/merge-account");
    const token = await createMergeToken(service, anonId);
    expect(await previewMerge(service, token)).toEqual({ knownTerms: 1, cards: 1, reviews: 0 });
    await expect(previewMerge(service, "x".repeat(43))).rejects.toMatchObject({ code: "invalid_token" });
    await expect(previewMerge(service, token, new Date(Date.now() + 31 * 60_000))).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("không gộp vào chính nó và không xóa tài khoản không ẩn danh", async () => {
    const { createMergeToken, executeMerge } = await import("@/lib/account/merge-account");
    const token = await createMergeToken(service, anonId);
    await expect(executeMerge(service, token, anonId)).rejects.toMatchObject({ code: "same_account" });
    const memberToken = await createMergeToken(service, memberId); // tài khoản thật không được coi là nguồn
    await expect(executeMerge(service, memberToken, anonId)).rejects.toMatchObject({ code: "not_anonymous" });
    expect((await service.auth.admin.getUserById(memberId)).data.user).not.toBeNull();
  });

  it("gộp: dữ liệu sang tài khoản đích, tài khoản ẩn danh bị xóa, mã dùng một lần", async () => {
    const { createMergeToken, executeMerge } = await import("@/lib/account/merge-account");
    const token = await createMergeToken(service, anonId);
    await executeMerge(service, token, memberId);
    expect((await service.from("user_cards").select("reps").eq("user_id", memberId)).data).toEqual([{ reps: 3 }]);
    expect((await service.from("user_known_terms").select("item_key").eq("user_id", memberId)).data).toEqual([{ item_key: "vocab:好" }]);
    expect((await service.auth.admin.getUserById(anonId)).data.user).toBeNull();
    await expect(executeMerge(service, token, memberId)).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("xóa tài khoản xóa luôn dữ liệu (cascade)", async () => {
    await service.from("user_cards").insert({ user_id: memberId, item_key: "vocab:新", kind: "vocab", term: "新", meaning: "mới" });
    await service.auth.admin.deleteUser(memberId);
    expect((await service.from("user_cards").select("item_key").eq("user_id", memberId)).data).toEqual([]);
    expect((await service.from("user_known_terms").select("item_key").eq("user_id", memberId)).data).toEqual([]);
  });
});
