import { describe, expect, it } from "vitest";
import { SCENES } from "./scenes";
import { SCENE_EMOJI, TOWN_DISTRICTS } from "./town-layout";

describe("bản đồ thị trấn", () => {
  it("mỗi cảnh thuộc đúng một khu phố và không có cảnh lạ", () => {
    const placed = TOWN_DISTRICTS.flatMap((d) => d.scenes);
    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual(Object.keys(SCENES).sort());
  });

  it("mỗi cảnh có biểu tượng", () => {
    for (const id of Object.keys(SCENES)) expect(SCENE_EMOJI[id], id).toBeTruthy();
  });
});
