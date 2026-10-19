import { describe, expect, it } from "vitest";
import { emptyDay } from "./aggregate-activity";
import { buildQuestViews, currentQuestSlots, questTitleOf, seedOf } from "./build-quests";

describe("currentQuestSlots", () => {
  it("xác định: cùng (user, ngày) luôn ra cùng bộ; đổi ngày hoặc người dùng thì có thể khác", () => {
    const a = currentQuestSlots("u1", "2026-10-20", "2026-10-19").map((s) => s.id);
    expect(currentQuestSlots("u1", "2026-10-20", "2026-10-19").map((s) => s.id)).toEqual(a);
    const days = new Set(Array.from({ length: 14 }, (_, i) => currentQuestSlots("u1", `2026-10-${10 + i}`, "2026-10-05").filter((s) => s.template.kind === "daily").map((s) => s.id.split(":")[2]).sort().join(",")));
    expect(days.size).toBeGreaterThan(1);
  });
  it("3 nhiệm vụ ngày không trùng, 3 nhiệm vụ tuần luôn có 'học 5 ngày' (thưởng đóng băng)", () => {
    const slots = currentQuestSlots("u1", "2026-10-20", "2026-10-19");
    const daily = slots.filter((s) => s.template.kind === "daily");
    const weekly = slots.filter((s) => s.template.kind === "weekly");
    expect(new Set(daily.map((s) => s.template.id)).size).toBe(3);
    expect(weekly).toHaveLength(3);
    expect(weekly.find((s) => s.template.id === "days5")?.template.rewardFreeze).toBe(true);
    expect(daily[0]).toMatchObject({ from: "2026-10-20", to: "2026-10-20" });
    expect(weekly[0]).toMatchObject({ from: "2026-10-19", to: "2026-10-25" });
  });
  it("id gắn với kỳ nên sang ngày mới là nhiệm vụ mới (làm mới theo múi giờ do ngày địa phương quyết định)", () => {
    const ids = (d: string) => currentQuestSlots("u1", d, "2026-10-19").filter((s) => s.template.kind === "daily").map((s) => s.id);
    expect(ids("2026-10-20").every((id) => id.startsWith("daily:2026-10-20:"))).toBe(true);
    expect(ids("2026-10-20").some((id) => ids("2026-10-21").includes(id))).toBe(false);
  });
  it("seedOf ổn định", () => {
    expect(seedOf("a")).toBe(seedOf("a"));
    expect(seedOf("a")).not.toBe(seedOf("b"));
  });
});

describe("buildQuestViews", () => {
  const slots = currentQuestSlots("u1", "2026-10-20", "2026-10-19");
  it("tiến độ lấy từ số liệu đúng kỳ, bị chặn ở mục tiêu; đủ thì claimable, nhận rồi thì claimed", () => {
    const first = slots[0];
    const stat = first.template.id === "review10" ? { reviews: 25 } : first.template.id === "listen1" ? { songsCompleted: 3 } : first.template.id === "speak1" ? { shadowingGood: 3 } : first.template.id === "dictate3" ? { dictationGood: 9 } : first.template.id === "practice1" ? { practiceRounds: 4 } : { unitsCompleted: 2 };
    const days = { "2026-10-20": { ...emptyDay(), ...stat }, "2026-10-19": { ...emptyDay(), reviews: 100 } };
    const v = buildQuestViews(slots, days, new Set(["2026-10-19", "2026-10-20"]), new Set()).find((q) => q.id === first.id)!;
    expect(v).toMatchObject({ progress: first.template.target, claimable: true, claimed: false });
    const claimed = buildQuestViews(slots, days, new Set(), new Set([first.id])).find((q) => q.id === first.id)!;
    expect(claimed).toMatchObject({ claimable: false, claimed: true });
  });
  it("nhiệm vụ tuần 'học 5 ngày' đếm ngày học trong tuần", () => {
    const week = ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-26"];
    const q = buildQuestViews(slots, {}, new Set(week), new Set()).find((x) => x.id.endsWith(":days5"))!;
    expect(q).toMatchObject({ progress: 5, target: 5, claimable: true, rewardFreeze: true });
  });
  it("tiêu đề nhiệm vụ cũ tra được từ id", () => {
    expect(questTitleOf("daily:2026-10-01:review10")).toBe("Ôn 10 thẻ");
    expect(questTitleOf("daily:2026-10-01:khong-co")).toBe("Nhiệm vụ");
  });
});
