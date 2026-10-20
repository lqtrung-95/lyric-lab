import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: vi.fn() }));

// Kho giả trong bộ nhớ thay cho Supabase: kiểm toàn bộ đường settle/claim/route mà không cần DB.
const db = vi.hoisted(() => ({
  data: null as unknown as import("./game-repo").GameData,
  claimBehavior: "ok" as "ok" | "error",
  savedBadges: [] as { id: string; tier: string }[],
  savedFreezes: [] as string[],
}));
vi.mock("./game-repo", () => ({
  loadGameData: async () => structuredClone(db.data),
  saveBadges: async (_u: string, fresh: { id: string; tier: string }[]) => { db.savedBadges.push(...fresh); return true; },
  saveFrozenDays: async (_u: string, days: string[]) => { db.savedFreezes.push(...days); return true; },
  insertQuestClaim: async (_u: string, row: { questId: string; kind: string; rewardXp: number; freezeGranted: boolean }) => {
    if (db.claimBehavior === "error") return "error";
    if (db.data.claims.some((c) => c.questId === row.questId)) return "duplicate";
    db.data.claims.push({ questId: row.questId, rewardXp: row.rewardXp, freezeGranted: row.freezeGranted, claimedAt: new Date().toISOString() });
    return "claimed";
  },
}));

import { getCurrentUser } from "@/lib/auth/current-user";
import { GET as getBadges } from "@/app/api/game/badges/route";
import { GET as getSummary } from "@/app/api/game/summary/route";
import { POST as claim } from "@/app/api/game/quests/[id]/claim/route";
import { currentQuestSlots } from "./build-quests";
import { dayKey } from "@/lib/streak/streak-logic";
import { weekStart } from "./aggregate-activity";

const TZ = "Asia/Ho_Chi_Minh";
const today = dayKey(new Date(), TZ);
const slots = () => currentQuestSlots("u1", today, weekStart(today));
const fresh = (over: Partial<typeof db.data> = {}) => ({ timeZone: TZ, raw: { reviews: [], rounds: [], songs: [], units: [], rooms: [] }, learnedWords: 0, levelsCompleted: 0, claims: [], storedBadges: [], frozenDays: [], ...over });
const call = (id: string) => claim(new Request("http://x", { method: "POST" }), { params: Promise.resolve({ id: encodeURIComponent(id) }) });

beforeEach(() => {
  db.data = fresh();
  db.claimBehavior = "ok";
  db.savedBadges = [];
  db.savedFreezes = [];
  vi.mocked(getCurrentUser).mockResolvedValue({ id: "u1", isAnonymous: true, email: null });
});

/** Dữ liệu thô đủ để hoàn thành nhiệm vụ đầu tiên của hôm nay. */
function completeFirstDailyQuest() {
  const slot = slots()[0];
  const at = new Date().toISOString();
  const t = slot.template.id;
  db.data.raw = {
    reviews: t === "review10" ? Array.from({ length: 10 }, () => ({ at })) : [],
    rounds: t === "dictate3" ? Array.from({ length: 3 }, () => ({ at, mode: "dictation", correct: 1, total: 1 })) : t === "speak1" ? [{ at, mode: "shadowing", correct: 1, total: 1 }] : t === "practice1" ? [{ at, mode: "cloze", correct: 3, total: 5 }] : [],
    songs: t === "listen1" ? [{ at, completed: true }] : [],
    units: t === "unit1" ? [{ at, bestScore: 90 }] : [],
    rooms: [],
  };
  return slot;
}

describe("GET /api/game/summary", () => {
  it("chưa có phiên → 401", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    expect((await getSummary()).status).toBe(401);
    expect((await getBadges()).status).toBe(401);
  });
  it("người dùng mới (bảng mới thiếu ⇒ dữ liệu rỗng) vẫn trả 200 đúng hình dạng hợp đồng", async () => {
    const res = await getSummary();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["badges", "ledger", "level", "quests", "streak", "xp"]);
    expect(body.quests).toHaveLength(6);
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });
  it("đọc cấp huy hiệu mới và ghi lại; lần đọc sau với dữ liệu đã lưu không ghi thêm", async () => {
    db.data.learnedWords = 12;
    await getSummary();
    expect(db.savedBadges).toEqual([{ id: "learn-words", tier: "bronze" }]);
    db.data.storedBadges = [{ id: "learn-words", tier: "bronze", earnedAt: "2026-10-20T00:00:00Z" }];
    db.savedBadges = [];
    await getSummary();
    expect(db.savedBadges).toEqual([]);
  });
});

describe("GET /api/game/badges", () => {
  it("trả toàn danh mục, huy hiệu ẩn chưa mở bị che", async () => {
    const { badges } = await (await getBadges()).json();
    expect(badges.length).toBeGreaterThan(10);
    expect(badges.find((b: { id: string }) => b.id === "hidden-perfect")).toMatchObject({ title: "???", unlocked: false });
  });
});

describe("POST /api/game/quests/[id]/claim", () => {
  it("nhiệm vụ không thuộc người dùng hiện tại (id lạ, kỳ cũ) → 404", async () => {
    expect((await call("daily:2020-01-01:review10")).status).toBe(404);
    expect((await call("bậy bạ")).status).toBe(404);
  });
  it("chưa đủ tiến độ → 409, không ghi thưởng", async () => {
    const res = await call(slots()[0].id);
    expect(res.status).toBe(409);
    expect(db.data.claims).toHaveLength(0);
  });
  it("đủ tiến độ → nhận thưởng; gọi lại idempotent, XP chỉ cộng một lần", async () => {
    const slot = completeFirstDailyQuest();
    const first = await (await call(slot.id)).json();
    expect(first.claimed).toBe(true);
    const quest = first.summary.quests.find((q: { id: string }) => q.id === slot.id);
    expect(quest).toMatchObject({ claimed: true, claimable: false });
    const xpAfter = first.summary.xp.total;
    const second = await (await call(slot.id)).json();
    expect(second.claimed).toBe(false);
    expect(second.summary.xp.total).toBe(xpAfter);
    expect(db.data.claims).toHaveLength(1);
  });
  it("hai yêu cầu đồng thời chỉ nhận một lần (khóa chính chặn)", async () => {
    const slot = completeFirstDailyQuest();
    const [a, b] = await Promise.all([call(slot.id), call(slot.id)]);
    const bodies = [await a.json(), await b.json()];
    expect(db.data.claims).toHaveLength(1);
    expect(bodies.filter((x) => x.claimed).length).toBeLessThanOrEqual(1);
  });
  it("bảng thưởng chưa có (migration chưa chạy) → 503, không 500", async () => {
    const slot = completeFirstDailyQuest();
    db.claimBehavior = "error";
    expect((await call(slot.id)).status).toBe(503);
  });
  it("đóng băng chỉ được cấp khi đang giữ dưới trần", async () => {
    const weekly = slots().find((s) => s.template.id === "days5")!;
    const longAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
    // 5 ngày học trong tuần hiện tại (đủ cho "học 5 ngày"); đang giữ sẵn 2 đóng băng = trần.
    db.data.raw.reviews = Array.from({ length: 5 }, (_, i) => ({ at: `${new Date(Date.parse(`${weekStart(today)}T05:00:00Z`) + i * 86_400_000).toISOString()}` }));
    db.data.claims = ["a", "b"].map((k) => ({ questId: `weekly:2026-01-05:${k}`, rewardXp: 0, freezeGranted: true, claimedAt: longAgo }));
    const res = await (await call(weekly.id)).json();
    expect(res.claimed).toBe(true);
    expect(db.data.claims.find((c) => c.questId === weekly.id)?.freezeGranted).toBe(false); // đã giữ 2 (trần)
  });
});
