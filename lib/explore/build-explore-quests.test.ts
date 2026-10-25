import { describe, expect, it } from "vitest";
import { buildQuestRounds } from "./build-explore-quests";
import { ROOM_SCENE } from "./scenes/room-scene";

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe("buildQuestRounds", () => {
  it("mỗi lượt có tối đa 8 câu, mỗi vật một câu, đủ ba kiểu", () => {
    const rounds = buildQuestRounds(ROOM_SCENE.objects, new Set(), seeded(7));
    expect(rounds).toHaveLength(8);
    expect(new Set(rounds.map((r) => r.targetId)).size).toBe(8);
    expect(new Set(rounds.map((r) => r.kind))).toEqual(new Set(["listen", "meaning", "hanzi"]));
  });

  it("vật ưu tiên (hay sai hoặc mờ) luôn nằm trong lượt", () => {
    const priority = new Set(["cat", "lamp", "door"]);
    for (let s = 1; s <= 20; s++) {
      const ids = buildQuestRounds(ROOM_SCENE.objects, priority, seeded(s)).map((r) => r.targetId);
      for (const id of priority) expect(ids).toContain(id);
    }
  });

  it("ít hơn 3 vật thì chưa chơi được; ít hơn 8 vật thì ra số câu bằng số vật", () => {
    expect(buildQuestRounds(ROOM_SCENE.objects.slice(0, 2), new Set())).toEqual([]);
    expect(buildQuestRounds(ROOM_SCENE.objects.slice(0, 5), new Set())).toHaveLength(5);
  });
});

describe("dữ liệu cảnh", () => {
  it("id và chữ Hán không trùng, vị trí nằm trong khung", () => {
    const ids = ROOM_SCENE.objects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ROOM_SCENE.objects.map((o) => o.term)).size).toBe(ids.length);
    for (const o of ROOM_SCENE.objects) {
      expect(o.x).toBeGreaterThan(0); expect(o.x).toBeLessThan(100);
      expect(o.y).toBeGreaterThan(0); expect(o.y).toBeLessThanOrEqual(100);
      expect(o.example.zh).toContain(o.term);
    }
  });
});
