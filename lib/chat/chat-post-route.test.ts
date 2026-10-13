import { beforeEach, describe, expect, it, vi } from "vitest";

// Quyền gửi tin của POST /api/chat: chỉ tài khoản đã đăng nhập Google, có biệt danh, không bị chặn, còn hạn mức; huy hiệu và loại "thông báo" chỉ dành cho admin (do server quyết).
type User = { id: string; isAnonymous: boolean; email: string | null } | null;
let user: User = null;
let blocked = false;
let profile: { nickname: string; avatarUrl: string | null } | null = { nickname: "Lan", avatarUrl: null };
let duplicate = false;
let allowed = true;
const inserted: Record<string, unknown>[] = [];

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: async () => user }));
vi.mock("@/lib/admin/admin-accounts", () => ({ isAdminAccount: (email: string | null) => email === "admin@example.com" }));
vi.mock("@/lib/leaderboard/profile-repo", () => ({ getProfile: async () => profile }));
vi.mock("@/lib/rate-limit/consume-usage", () => ({ consumeUsage: async () => allowed }));
vi.mock("@/lib/chat/chat-repo", () => ({
  isChatBlocked: async () => blocked,
  sentSameRecently: async () => duplicate,
  listMessages: async () => ({ messages: [], hasMore: false, deletedIds: [] }),
  insertMessage: async (input: Record<string, unknown>) => { inserted.push(input); return { id: 1, nickname: input.nickname, avatarUrl: null, isAdmin: input.isAdmin, kind: input.kind, body: input.body, createdAt: "2026-10-14T00:00:00Z" }; },
}));

const { POST } = await import("@/app/api/chat/route");
const post = (body: unknown) => POST(new Request("http://x/api/chat", { method: "POST", body: JSON.stringify(body) }));
const registered = { id: "u1", isAnonymous: false, email: "lan@example.com" };

beforeEach(() => {
  user = registered; blocked = false; profile = { nickname: "Lan", avatarUrl: null }; duplicate = false; allowed = true; inserted.length = 0;
});

describe("POST /api/chat", () => {
  it("chưa có phiên: 401", async () => {
    user = null;
    expect((await post({ body: "xin chào" })).status).toBe(401);
  });
  it("tài khoản ẩn danh: 403 account_required, không ghi gì", async () => {
    user = { id: "a1", isAnonymous: true, email: null };
    const res = await post({ body: "xin chào" });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "account_required" });
    expect(inserted).toHaveLength(0);
  });
  it("tài khoản Google có biệt danh gửi được; không có huy hiệu admin", async () => {
    const res = await post({ body: "  Chào   mọi người  " });
    expect(res.status).toBe(200);
    expect(inserted[0]).toMatchObject({ userId: "u1", nickname: "Lan", isAdmin: false, kind: "chat", body: "Chào mọi người" });
  });
  it("người thường không tự đặt được thông báo dù gửi announcement=true", async () => {
    await post({ body: "thông báo giả", announcement: true });
    expect(inserted[0]).toMatchObject({ isAdmin: false, kind: "chat" });
  });
  it("admin có huy hiệu và gửi được thông báo; admin được gửi link", async () => {
    user = { id: "ad", isAnonymous: false, email: "admin@example.com" };
    expect((await post({ body: "Xem https://songhanzi.com nhé", announcement: true })).status).toBe(200);
    expect(inserted[0]).toMatchObject({ isAdmin: true, kind: "announcement" });
  });
  it("chưa có biệt danh: 409; bị chặn: 403; trùng tin: 400; hết hạn mức: 429", async () => {
    profile = null;
    expect(((await post({ body: "xin chào" })).status)).toBe(409);
    profile = { nickname: "Lan", avatarUrl: null };
    blocked = true;
    const b = await post({ body: "xin chào" });
    expect(b.status).toBe(403);
    expect(await b.json()).toEqual({ error: "blocked" });
    blocked = false; duplicate = true;
    expect((await post({ body: "xin chào" })).status).toBe(400);
    duplicate = false; allowed = false;
    expect((await post({ body: "xin chào" })).status).toBe(429);
    expect(inserted).toHaveLength(0);
  });
  it("nội dung không hợp lệ: link với người thường, từ tục, rỗng", async () => {
    for (const [body, error] of [["vào http://spam.com", "has_link"], ["dit me", "inappropriate"], ["   ", "empty"]] as const) {
      const res = await post({ body });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error });
    }
    expect(inserted).toHaveLength(0);
  });
});
