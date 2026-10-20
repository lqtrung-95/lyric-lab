import { describe, expect, it } from "vitest";
import type { RawActivity } from "./aggregate-activity";
import { computeGame, freezesAvailable, type GameInputs } from "./build-game-summary";
import { currentQuestSlots } from "./build-quests";

const NOW = new Date("2026-10-20T05:00:00Z"); // 12:00 ngày 20 ở Việt Nam
const empty: RawActivity = { reviews: [], rounds: [], songs: [], units: [], rooms: [] };
const base = (over: Partial<GameInputs> = {}): GameInputs => ({
  userId: "u1", now: NOW, timeZone: "Asia/Ho_Chi_Minh", raw: empty, learnedWords: 0, levelsCompleted: 0, claims: [], storedBadges: [], frozenDays: [], ...over,
});
const reviewsOn = (day: string, n: number) => Array.from({ length: n }, (_, i) => ({ at: `${day}T0${i % 9}:00:00Z` }));

describe("computeGame", () => {
  it("người mới: mọi thứ bằng 0, cấp 1, vẫn có nhiệm vụ", () => {
    const g = computeGame(base());
    expect(g.summary.xp).toMatchObject({ total: 0, today: 0 });
    expect(g.summary.level.n).toBe(1);
    expect(g.summary.streak).toMatchObject({ current: 0, freezes: 0 });
    expect(g.summary.quests).toHaveLength(6);
    expect(g.summary.badges.earned).toEqual([]);
  });
  it("XP hôm nay theo ngày địa phương và giải thích được từng khoản", () => {
    // 20:00 UTC ngày 19 = 03:00 ngày 20 ở Việt Nam → tính vào hôm nay
    const g = computeGame(base({ raw: { ...empty, reviews: [{ at: "2026-10-19T20:00:00Z" }, { at: "2026-10-19T10:00:00Z" }] } }));
    expect(g.summary.xp.today).toBe(2); // chỉ lượt lúc 03:00 sáng ngày 20
    expect(g.summary.xp.total).toBe(4);
    expect(g.summary.ledger[0]).toMatchObject({ day: "2026-10-20", source: "review", xp: 2, reason: "Ôn 1 thẻ" });
    const sources = g.summary.xp.todaySources.find((s) => s.source === "review");
    expect(sources).toMatchObject({ xp: 2, cap: 100 });
  });
  it("trần ngày: cày 300 lượt ôn một ngày vẫn chỉ được 100 XP", () => {
    const g = computeGame(base({ raw: { ...empty, reviews: reviewsOn("2026-10-20", 300) } }));
    expect(g.summary.xp.today).toBe(100);
  });
  it("cùng dữ liệu thì cùng kết quả, kể cả huy hiệu mới (idempotent); đã lưu rồi thì không còn mới", () => {
    const input = base({ raw: { ...empty, reviews: reviewsOn("2026-10-20", 60) }, learnedWords: 12 });
    const a = computeGame(input);
    expect(computeGame(input).summary).toEqual(a.summary);
    expect(a.freshBadges.map((b) => b.id).sort()).toEqual(["hidden-early-bird", "learn-reviews", "learn-words"]);
    const stored = a.freshBadges.map((b) => ({ ...b, earnedAt: "2026-10-20T05:00:00Z" }));
    expect(computeGame({ ...input, storedBadges: stored }).freshBadges).toEqual([]);
  });
  it("nhận thưởng nhiệm vụ cộng vào XP và sổ cái một lần duy nhất", () => {
    const slot = currentQuestSlots("u1", "2026-10-20", "2026-10-19")[0];
    const claim = { questId: slot.id, rewardXp: slot.template.rewardXp, freezeGranted: false, claimedAt: "2026-10-20T05:00:00Z" };
    const g = computeGame(base({ claims: [claim] }));
    expect(g.summary.xp.total).toBe(slot.template.rewardXp);
    expect(g.summary.quests.find((q) => q.id === slot.id)?.claimed).toBe(true);
    expect(g.summary.ledger[0]).toMatchObject({ source: "quest", reason: `Hoàn thành nhiệm vụ: ${slot.template.title}` });
  });
  it("đóng băng: lỡ hôm qua, đang giữ 1 lượt → tự dùng, chuỗi giữ; hết lượt thì chuỗi đứt", () => {
    const raw = { ...empty, reviews: [...reviewsOn("2026-10-17", 1), ...reviewsOn("2026-10-18", 1)] }; // lỡ 19
    const earned = { questId: "weekly:2026-10-12:days5", rewardXp: 50, freezeGranted: true, claimedAt: "2026-10-16T05:00:00Z" };
    const saved = computeGame(base({ raw, claims: [earned] }));
    expect(saved.newFrozenDays).toEqual(["2026-10-19"]);
    expect(saved.summary.streak).toMatchObject({ current: 2, freezes: 0, frozenDays: ["2026-10-19"] });
    // Sau khi đã ghi ngày đóng băng: không dùng thêm, kết quả không đổi.
    const again = computeGame(base({ raw, claims: [earned], frozenDays: ["2026-10-19"] }));
    expect(again.newFrozenDays).toEqual([]);
    expect(again.summary.streak).toEqual(saved.summary.streak);
    expect(computeGame(base({ raw })).summary.streak.current).toBe(0);
  });
  it("freezesAvailable không âm", () => {
    expect(freezesAvailable([], ["2026-10-01"])).toBe(0);
  });
  it("hôm nay Chủ nhật cuối tuần theo múi giờ: nhiệm vụ tuần đổi sang tuần mới đúng giờ địa phương", () => {
    const sun = computeGame(base({ now: new Date("2026-10-25T16:00:00Z") })); // 23:00 CN 25/10 ở VN
    const mon = computeGame(base({ now: new Date("2026-10-25T17:30:00Z") })); // 00:30 T2 26/10 ở VN
    expect(sun.summary.quests.find((q) => q.kind === "weekly")?.id).toContain("weekly:2026-10-19:");
    expect(mon.summary.quests.find((q) => q.kind === "weekly")?.id).toContain("weekly:2026-10-26:");
  });
});
