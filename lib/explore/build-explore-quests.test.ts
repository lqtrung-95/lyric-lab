import { describe, expect, it } from "vitest";
import { buildQuestRounds, roundNeedsDelivery } from "./build-explore-quests";
import { ROOM_SCENE } from "./scenes/room-scene";

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe("buildQuestRounds", () => {
  it("mỗi lượt có tối đa 8 câu, mỗi vật một câu, có nhiều kiểu câu", () => {
    const rounds = buildQuestRounds(ROOM_SCENE.objects, new Set(), seeded(7));
    expect(rounds).toHaveLength(8);
    expect(new Set(rounds.map((r) => r.targetId)).size).toBe(8);
    const kinds = new Set(rounds.map((r) => r.kind));
    for (const k of ["listen", "meaning", "hanzi", "command"]) expect(kinds.has(k as never), k).toBe(true);
  });

  it("câu 'mang đồ' chỉ ra với vật mang được; đủ cả năm kiểu khi mọi vật đều mang được", () => {
    for (let s = 1; s <= 30; s++) {
      for (const r of buildQuestRounds(ROOM_SCENE.objects, new Set(), seeded(s))) {
        if (r.kind === "bring") expect(ROOM_SCENE.objects.find((o) => o.id === r.targetId)?.portable, r.targetId).toBe(true);
      }
    }
    const portable = ROOM_SCENE.objects.filter((o) => o.portable);
    const kinds = new Set(buildQuestRounds(portable.slice(0, 5), new Set(), seeded(3), 5).map((r) => r.kind));
    expect(kinds.size).toBe(5);
  });

  it("phải giao đồ cho NPC khi là câu 'mang đồ' hoặc lệnh với vật mang được", () => {
    expect(roundNeedsDelivery("bring", true)).toBe(true);
    expect(roundNeedsDelivery("command", true)).toBe(true);
    expect(roundNeedsDelivery("command", false)).toBe(false);
    expect(roundNeedsDelivery("meaning", true)).toBe(false);
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
      if (o.stand) { expect(o.stand.x).toBeGreaterThan(0); expect(o.stand.y).toBeGreaterThanOrEqual(38); }
    }
    expect(ids).not.toContain(ROOM_SCENE.npc.id);
  });
});
