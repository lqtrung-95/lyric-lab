import { beforeEach, describe, expect, it, vi } from "vitest";

// Kho yêu thích: đọc trả rỗng khi lỗi/chưa có phiên; ghi trả trạng thái THẬT (lỗi ghi thì giao diện hoàn tác thay vì giả vờ đã lưu).
let hasSession = true;
let ensured = true;
let userId: string | undefined = "u1";
let selectResult: { data: { video_id: string }[] | null; error: unknown } = { data: [], error: null };
let writeError: unknown = null;
const calls: string[] = [];

vi.mock("@/lib/auth/ensure-anonymous-session", () => ({ hasExistingSession: async () => hasSession, ensureAnonymousSession: async () => ensured }));
vi.mock("@/lib/supabase/browser-client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { getSession: async () => ({ data: { session: userId ? { user: { id: userId } } : null } }) },
    from: (table: string) => ({
      select: async () => { calls.push(`select ${table}`); return selectResult; },
      upsert: async (row: unknown) => { calls.push(`upsert ${table} ${JSON.stringify(row)}`); return { error: writeError }; },
      delete: () => ({ eq: () => ({ eq: async () => { calls.push(`delete ${table}`); return { error: writeError }; } }) }),
    }),
  }),
}));

const { createLikesRepo } = await import("./likes-repo");
const videos = createLikesRepo("user_video_likes");

beforeEach(() => { hasSession = true; ensured = true; userId = "u1"; selectResult = { data: [{ video_id: "a" }, { video_id: "b" }], error: null }; writeError = null; calls.length = 0; });

describe("listLikedIds", () => {
  it("đọc đúng bảng và trả các videoId", async () => {
    expect(await videos.listLikedIds()).toEqual(["a", "b"]);
    expect(calls).toEqual(["select user_video_likes"]);
  });
  it("chưa có phiên hoặc lỗi đọc (bảng chưa có) thì rỗng, không ném lỗi và không tạo phiên", async () => {
    hasSession = false;
    expect(await videos.listLikedIds()).toEqual([]);
    expect(calls).toEqual([]);
    hasSession = true; selectResult = { data: null, error: { message: "relation does not exist" } };
    expect(await videos.listLikedIds()).toEqual([]);
  });
});

describe("toggleLike", () => {
  it("thích: tạo phiên nếu cần rồi upsert đúng bảng, trả true", async () => {
    expect(await videos.toggleLike("v1", true)).toBe(true);
    expect(calls).toEqual(['upsert user_video_likes {"user_id":"u1","video_id":"v1"}']);
  });
  it("bỏ thích: xóa, trả false; chưa có phiên thì không làm gì", async () => {
    expect(await videos.toggleLike("v1", false)).toBe(false);
    expect(calls).toEqual(["delete user_video_likes"]);
    hasSession = false; calls.length = 0;
    expect(await videos.toggleLike("v1", false)).toBe(false);
    expect(calls).toEqual([]);
  });
  it("ghi lỗi thì trả trạng thái cũ để giao diện hoàn tác", async () => {
    writeError = { message: "lỗi" };
    expect(await videos.toggleLike("v1", true)).toBe(false); // thích thất bại: vẫn chưa thích
    expect(await videos.toggleLike("v1", false)).toBe(true); // bỏ thích thất bại: vẫn đang thích
  });
  it("không tạo được phiên thì không thích được", async () => {
    ensured = false;
    expect(await videos.toggleLike("v1", true)).toBe(false);
  });
});
