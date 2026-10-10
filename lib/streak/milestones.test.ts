import { describe, expect, it } from "vitest";
import { computeMilestones, diffNewMilestones, nextMilestones } from "./milestones";

const input = { longest: 8, learnedWords: 60, videoLines: 0 };

describe("computeMilestones", () => {
  it("đánh dấu các mốc đã đạt theo từng nhóm (kỷ lục chuỗi, từ đã ôn, câu học video)", () => {
    const earned = computeMilestones(input).filter((m) => m.earned).map((m) => m.id);
    expect(earned).toEqual(["streak-3", "streak-7", "words-10", "words-50"]);
  });
});

describe("nextMilestones", () => {
  it("lấy mốc chưa đạt gần nhất của từng nhóm với số còn thiếu", () => {
    const next = nextMilestones(computeMilestones(input));
    expect(next.map((n) => [n.milestone.id, n.remaining])).toEqual([["streak-14", 6], ["words-100", 40], ["video-10", 10]]);
  });
  it("nhóm đã đạt hết thì không còn mốc kế", () => {
    expect(nextMilestones(computeMilestones({ longest: 500, learnedWords: 5000, videoLines: 9999 }))).toEqual([]);
  });
});

describe("diffNewMilestones", () => {
  const ms = computeMilestones(input);
  it("lần đầu chỉ ghi nhận, không báo mốc nào", () => {
    const r = diffNewMilestones(ms, null);
    expect(r.fresh).toEqual([]);
    expect(r.seen).toContain("streak-7");
  });
  it("báo đúng các mốc mới so với danh sách đã thấy", () => {
    const r = diffNewMilestones(ms, ["streak-3", "words-10"]);
    expect(r.fresh.map((m) => m.id)).toEqual(["streak-7", "words-50"]);
  });
});
