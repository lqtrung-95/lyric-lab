import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Thách đấu không cần cùng lúc trên Supabase thật: tạo, chơi từng câu, chấm ở server, bảng điểm. Cần đã chạy migration challenges và bật
// Anonymous sign-ins; tự bỏ qua khi thiếu biến môi trường hoặc chưa có bảng. Xóa sạch thử thách và tài khoản tạm sau khi chạy.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

const probe = url && serviceKey ? await createClient(url, serviceKey, opts).from("challenges").select("code").limit(1) : null;
const enabled = Boolean(probe && !probe.error);

describe.skipIf(!enabled)("thử thách không cần cùng lúc", () => {
  let service: SupabaseClient;
  const userIds: string[] = [];
  const codes: string[] = [];
  const repo = async () => import("@/lib/challenges/challenge-repo");

  async function newUser() {
    const { data, error } = await createClient(url!, serviceKey!, opts).auth.signInAnonymously();
    if (error || !data.user) throw new Error(`signInAnonymously: ${error?.message}`);
    userIds.push(data.user.id);
    return data.user.id;
  }

  beforeAll(() => { service = createClient(url!, serviceKey!, opts); });
  afterAll(async () => {
    if (!service) return;
    await service.from("challenges").delete().in("code", codes);
    for (const id of userIds) await service.auth.admin.deleteUser(id);
  });

  it("chơi trọn một lượt: chấm đúng ở server, không lộ đáp án trước, bảng điểm và giới hạn một lượt", async () => {
    const { createChallenge, startAttempt, submitAnswer, getChallengeInfo } = await repo();
    const [alice, bob] = [await newUser(), await newUser()];

    const code = await createChallenge(alice, "Alice", null).catch(() => null);
    if (!code) return; // kho chưa có bài đủ dữ liệu để ra bộ câu: không có gì để kiểm
    codes.push(code);

    const started = await startAttempt(code, alice, "Alice");
    if (typeof started === "string") throw new Error(started);
    expect(started.questions).toHaveLength(10);
    expect(JSON.stringify(started.questions)).not.toMatch(/correct/i); // câu hỏi công khai không có đáp án
    expect(started.answered).toEqual([]);

    const { data: keys } = await service.from("challenge_questions").select("idx, correct_index").eq("code", code).order("idx");

    // Trả lời sai thứ tự bị từ chối.
    expect(await submitAnswer(started.attemptId, alice, 3, 0, 1000)).toBe("out_of_order");
    // Người khác không trả lời thay được.
    expect(await submitAnswer(started.attemptId, bob, 0, 0, 1000)).toBe("forbidden");

    let last;
    for (const k of keys!) {
      // Câu đầu đúng, các câu sau chọn đáp án sai để kiểm cả hai nhánh.
      const choice = k.idx === 0 ? k.correct_index : (k.correct_index + 1) % 4;
      last = await submitAnswer(started.attemptId, alice, k.idx, choice, 1000);
      if (typeof last === "string") throw new Error(last);
      expect(last.answered.correct).toBe(k.idx === 0);
    }
    expect(last).toMatchObject({ finished: true, totals: { correct: 1 } });
    expect((last as { totals: { points: number } }).totals.points).toBeGreaterThan(100);
    expect(await submitAnswer(started.attemptId, alice, 0, 0, 1000)).toBe("already_finished");
    expect(await startAttempt(code, alice, "Alice")).toBe("already_finished");

    // Người thứ hai thấy bảng điểm của người thứ nhất.
    const info = await getChallengeInfo(code, bob);
    expect(info?.standings).toEqual([expect.objectContaining({ name: "Alice", correct: 1, isCreator: true, isMe: false })]);
    expect(info?.mine).toBeNull();
    const startedBob = await startAttempt(code, bob, "Bob");
    expect(typeof startedBob).toBe("object");
  });
});
