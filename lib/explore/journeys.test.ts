import { describe, expect, it } from "vitest";
import { progressKey, type ExploreProgress } from "./explore-progress";
import { completedJourneys, journeyStatus, JOURNEYS, stepsAtScene, stepStatus, STEP_MIN_CORRECT } from "./journeys";
import { SCENES } from "./scenes";

const prog = (entries: [string, string, number][]): ExploreProgress => ({ terms: Object.fromEntries(entries.map(([s, o, c]) => [progressKey(s, o), { discoveredAt: 1, lastSeenAt: 1, correct: c, wrong: 0 }])) });

describe("dữ liệu hành trình", () => {
  it("id không trùng; mỗi bước nằm ở cảnh có thật với đúng 3 từ mục tiêu khác nhau", () => {
    expect(new Set(JOURNEYS.map((j) => j.id)).size).toBe(JOURNEYS.length);
    for (const j of JOURNEYS) {
      expect(j.steps.length, j.id).toBeGreaterThanOrEqual(4);
      for (const s of j.steps) {
        const scene = SCENES[s.sceneId];
        expect(scene, `${j.id}: cảnh ${s.sceneId}`).toBeDefined();
        expect(s.targets).toHaveLength(3);
        expect(new Set(s.targets).size).toBe(3);
        for (const t of s.targets) expect(scene.objects.some((o) => o.id === t), `${s.sceneId}:${t}`).toBe(true);
        expect(s.vi.length).toBeGreaterThan(0);
      }
    }
  });
  it("câu hướng dẫn dùng đủ cả 3 từ mục tiêu và không quá dài", () => {
    for (const j of JOURNEYS) for (const s of j.steps) {
      for (const t of s.targets) expect(s.zh, `${s.sceneId}: ${t}`).toContain(SCENES[s.sceneId].objects.find((o) => o.id === t)!.term);
      expect(s.zh.length).toBeLessThanOrEqual(40);
    }
  });
});

describe("stepStatus", () => {
  const step = { sceneId: "room", targets: ["a", "b", "c"], zh: "", vi: "" };
  it("chưa học gì thì chưa xong", () => {
    expect(stepStatus(step, prog([]))).toEqual({ done: false, learned: 0, total: 3, correct: 0, need: STEP_MIN_CORRECT });
  });
  it("học đủ 3 từ nhưng chưa trả lời đúng thì chưa xong", () => {
    expect(stepStatus(step, prog([["room", "a", 0], ["room", "b", 0], ["room", "c", 0]])).done).toBe(false);
  });
  it("học đủ và có ít nhất 2 lần đúng (cộng dồn) thì xong; thiếu một từ thì chưa", () => {
    expect(stepStatus(step, prog([["room", "a", 1], ["room", "b", 1], ["room", "c", 0]])).done).toBe(true);
    expect(stepStatus(step, prog([["room", "a", 5], ["room", "b", 5]])).done).toBe(false);
    expect(stepStatus(step, prog([["room", "a", 5], ["room", "b", 5], ["room", "c", 5]])).correct).toBe(STEP_MIN_CORRECT);
  });
  it("từ cùng id ở cảnh khác không tính", () => {
    expect(stepStatus(step, prog([["kitchen", "a", 3], ["kitchen", "b", 3], ["kitchen", "c", 3]])).learned).toBe(0);
  });
});

describe("journeyStatus", () => {
  const j = JOURNEYS[0];
  const doneStep = (i: number): [string, string, number][] => j.steps[i].targets.map((t): [string, string, number] => [j.steps[i].sceneId, t, 1]);
  it("current là bước đầu tiên chưa xong, hoàn thành khi xong hết", () => {
    expect(journeyStatus(j, prog([])).current).toBe(0);
    expect(journeyStatus(j, prog([...doneStep(0), ...doneStep(1)]))).toMatchObject({ doneCount: 2, current: 2, complete: false });
    const all = j.steps.flatMap((_, i) => doneStep(i));
    expect(journeyStatus(j, prog(all))).toMatchObject({ doneCount: j.steps.length, current: null, complete: true });
    expect(completedJourneys(prog(all))).toBeGreaterThanOrEqual(1);
  });
});

describe("stepsAtScene", () => {
  it("trả các bước của mọi hành trình ở cảnh đó", () => {
    expect(stepsAtScene("breakfast").map((x) => `${x.journey.id}:${x.index}`)).toEqual(["commute:1"]);
    expect(stepsAtScene("không-có")).toEqual([]);
  });
});
