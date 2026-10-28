import { describe, expect, it } from "vitest";
import type { GameSummary, QuestView } from "./game-types";
import { rewardSoundFor } from "./reward-sound";

const quest = (id: string, claimable = false, claimed = false): QuestView => ({ id, kind: "daily", title: id, progress: 0, target: 1, rewardXp: 10, rewardFreeze: false, claimable, claimed });
const base = (): GameSummary => ({
  xp: { total: 100, today: 10, todayCap: 300, todaySources: [] },
  level: { n: 2, name: "x", progressXp: 0, nextXp: 100, maxed: false },
  streak: { current: 3, longest: 3, freezes: 0, studiedToday: true, week: [], frozenDays: [] },
  quests: [quest("a")], badges: { earned: [], recent: [] }, ledger: [],
});

describe("rewardSoundFor", () => {
  it("không phát khi chưa có bản trước hoặc không đổi", () => {
    expect(rewardSoundFor(null, base())).toBeNull();
    expect(rewardSoundFor(undefined, base())).toBeNull();
    expect(rewardSoundFor(base(), base())).toBeNull();
  });
  it("nhận XP", () => { const n = base(); n.xp.total = 125; expect(rewardSoundFor(base(), n)).toBe("xp"); });
  it("tăng chuỗi ngày thắng nhận XP", () => { const n = base(); n.xp.total = 125; n.streak.current = 4; expect(rewardSoundFor(base(), n)).toBe("streak"); });
  it("nhiệm vụ vừa hoàn thành thắng chuỗi và XP", () => { const n = base(); n.xp.total = 125; n.streak.current = 4; n.quests = [quest("a", true)]; expect(rewardSoundFor(base(), n)).toBe("quest"); });
  it("nhiệm vụ đã nhận thưởng từ trước không phát lại", () => { const p = base(); p.quests = [quest("a", true)]; const n = base(); n.quests = [quest("a", true)]; expect(rewardSoundFor(p, n)).toBeNull(); });
  it("lên cấp hoặc huy hiệu mới là cao nhất", () => {
    const n = base(); n.level.n = 3; n.quests = [quest("a", true)]; expect(rewardSoundFor(base(), n)).toBe("levelup");
    const b = base(); b.badges.earned = [{ id: "x", tier: "bronze", earnedAt: null }]; expect(rewardSoundFor(base(), b)).toBe("levelup");
  });
});
