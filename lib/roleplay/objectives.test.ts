import { describe, expect, it } from "vitest";
import { OBJECTIVES, completedObjectives, objectivesOf } from "./objectives";
import { SCENARIOS } from "./scenarios";

describe("mục tiêu tình huống", () => {
  it("mỗi tình huống thường có đúng 3 mục tiêu, id không trùng, mẫu khớp câu gợi ý của chính nó", () => {
    for (const s of SCENARIOS.filter((x) => !x.hidden)) {
      const list = objectivesOf(s.id);
      expect(list.length, s.id).toBe(3);
      expect(new Set(list.map((o) => o.id)).size, s.id).toBe(3);
      for (const o of list) expect(o.test.test(o.hint), `${s.id}/${o.id} phải nhận câu gợi ý "${o.hint}"`).toBe(true);
    }
    for (const id of Object.keys(OBJECTIVES)) expect(SCENARIOS.some((s) => s.id === id), id).toBe(true);
  });
  it("câu gợi ý của một mục tiêu không tự đạt hết mục tiêu khác (để mục tiêu có nghĩa)", () => {
    for (const [id, list] of Object.entries(OBJECTIVES)) for (const o of list) {
      const hit = list.filter((p) => p.test.test(o.hint)).length;
      expect(hit, `${id}/${o.id}`).toBeLessThanOrEqual(2);
    }
  });
  it("đạt mục tiêu khi nói đúng ý, giữ nguyên qua các câu sau", () => {
    expect(completedObjectives("cafe", ["你好，我要一杯拿铁。", "大杯的，多少钱？"])).toEqual(new Set(["order", "size", "price"]));
    expect(completedObjectives("cafe", ["你好"])).toEqual(new Set());
    expect(completedObjectives("taxi", ["我要去机场。", "要多久？"])).toEqual(new Set(["dest", "duration"]));
    expect(completedObjectives("hotel", ["我订了一个房间", "早餐几点开始"])).toEqual(new Set(["checkin", "breakfast"]));
  });
  it("tình huống không có mục tiêu (linh vật) trả rỗng", () => {
    expect(objectivesOf("pet")).toEqual([]);
    expect(completedObjectives("pet", ["我要一杯"])).toEqual(new Set());
  });
});
