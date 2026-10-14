import { beforeEach, describe, expect, it, vi } from "vitest";

// Cổng kiểm của việc nhờ AI nghe một đoạn video: video đã có/không nhúng được/quá dài, hạn mức riêng và chung, hoàn lượt khi AI lỗi, admin không bị hạn mức chung.
vi.mock("server-only", () => ({}));
let existing: { video_id: string } | null = null;
let meta: { embeddable: boolean; durationSec: number } | undefined = { embeddable: true, durationSec: 1301 };
let globalCount = 0;
let allowed = true;
let aiFails = false;
const refunds: string[] = [];
const consumed: string[] = [];

vi.mock("@/lib/env/server-env", () => ({ getServerEnv: () => ({ YOUTUBE_DATA_API_KEY: "k" }) }));
vi.mock("@/lib/analysis/server-deps", () => ({ createChat: () => async () => { if (aiFails) throw new Error("Gemini 503"); return JSON.stringify([{ start: "02:04", end: "02:07", text: "你好" }]); } }));
vi.mock("@/lib/admin/admin-accounts", () => ({ isAdminAccount: (email: string | null) => email === "admin@example.com" }));
vi.mock("@/lib/rate-limit/consume-usage", () => ({ consumeUsage: async (_u: unknown, kind: string) => { consumed.push(kind); return allowed; }, refundUsage: async (_u: unknown, kind: string) => { refunds.push(kind); } }));
vi.mock("@/lib/video/youtube-data-api", () => ({ fetchVideosMeta: async () => new Map(meta ? [["abcdefghijk", meta]] : []) }));
vi.mock("@/lib/supabase/service-client", () => ({
  createSupabaseServiceClient: () => ({
    from: (table: string) => table === "video_lessons"
      ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: existing, error: null }) }) }) }
      : { select: () => ({ eq: () => ({ gte: async () => ({ count: globalCount, error: null }) }) }) },
  }),
}));

const { transcribeChunkForUser, GLOBAL_ASR_CHUNKS_PER_DAY } = await import("./transcribe-chunk-for-user");
const member = { id: "u1", isAnonymous: false, email: "lan@example.com" };
const run = (chunk = 0, user: typeof member = member) => transcribeChunkForUser(user as never, "abcdefghijk", chunk);

beforeEach(() => {
  existing = null; meta = { embeddable: true, durationSec: 1301 }; globalCount = 0; allowed = true; aiFails = false; refunds.length = 0; consumed.length = 0;
});

describe("transcribeChunkForUser", () => {
  it("trả dòng theo giờ tuyệt đối và tổng số đoạn, trừ đúng một lượt transcribe", async () => {
    const out = await run(1); // đoạn 1 sở hữu 120–240 giây
    expect(out).toMatchObject({ kind: "ok", chunkCount: 11 });
    if (out.kind === "ok") expect(out.lines).toEqual([{ text: "你好", start: 124, end: 127 }]);
    expect(consumed).toEqual(["transcribe"]);
  });
  it("tài khoản ẩn danh bị chặn ngay: không trừ lượt, không đọc DB", async () => {
    expect((await run(0, { ...member, isAnonymous: true })).kind).toBe("account_required");
    expect(consumed).toHaveLength(0);
  });
  it("video đã có trong kho, không tìm thấy, không nhúng được, quá ngắn/dài: dừng trước khi trừ lượt", async () => {
    existing = { video_id: "abcdefghijk" };
    expect((await run()).kind).toBe("exists");
    existing = null; meta = undefined;
    expect((await run()).kind).toBe("not_found");
    meta = { embeddable: false, durationSec: 600 };
    expect((await run()).kind).toBe("not_embeddable");
    meta = { embeddable: true, durationSec: 10 };
    expect((await run()).kind).toBe("too_short");
    meta = { embeddable: true, durationSec: 31 * 60 };
    expect((await run()).kind).toBe("too_long");
    expect(consumed).toHaveLength(0);
  });
  it("đoạn không tồn tại: invalid_chunk", async () => {
    expect((await run(99)).kind).toBe("invalid_chunk");
  });
  it("hết hạn mức riêng: user_limit; hết hạn mức chung: global_limit (không trừ lượt)", async () => {
    allowed = false;
    expect((await run()).kind).toBe("user_limit");
    allowed = true; globalCount = GLOBAL_ASR_CHUNKS_PER_DAY;
    expect((await run()).kind).toBe("global_limit");
    expect(consumed).toEqual(["transcribe"]);
  });
  it("admin không bị hạn mức chung", async () => {
    globalCount = GLOBAL_ASR_CHUNKS_PER_DAY;
    expect((await run(0, { id: "ad", isAnonymous: false, email: "admin@example.com" })).kind).toBe("ok");
  });
  it("AI lỗi: ai_unavailable và hoàn lại lượt", async () => {
    aiFails = true;
    expect((await run()).kind).toBe("ai_unavailable");
    expect(refunds).toEqual(["transcribe"]);
  });
});
