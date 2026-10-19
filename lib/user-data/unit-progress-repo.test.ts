import { describe, expect, it } from "vitest";
import { mergeProgress } from "./unit-progress-repo";

const prev = { unitId: "u", status: "completed" as const, bestScore: 90, stepState: { step: 4 }, completedAt: "2026-10-01T00:00:00.000Z" };
describe("mergeProgress", () => {
  it("điểm giữ mức cao nhất; đã hoàn thành thì không tụt về dở dang và giữ ngày hoàn thành đầu tiên", () => {
    const m = mergeProgress(prev, { status: "in_progress", score: 60 });
    expect(m).toMatchObject({ status: "completed", bestScore: 90, completedAt: "2026-10-01T00:00:00.000Z" });
  });
  it("lần đầu hoàn thành: ghi ngày; dở dang thì chưa có ngày hoàn thành", () => {
    const now = new Date("2026-10-19T10:00:00.000Z");
    expect(mergeProgress(undefined, { status: "completed", score: 82.4 }, now)).toMatchObject({ status: "completed", bestScore: 82, completedAt: now.toISOString() });
    expect(mergeProgress(undefined, { status: "in_progress", score: 0, stepState: { step: 2 } }, now)).toMatchObject({ status: "in_progress", completedAt: null, stepState: { step: 2 } });
  });
});
