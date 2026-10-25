import { describe, expect, it } from "vitest";
import { emptyProgress, markDiscovered, progressKey } from "./explore-progress";
import { learnedTerms } from "./learned-terms";
import { ROOM_SCENE } from "./scenes/room-scene";

describe("learnedTerms", () => {
  it("trả đúng các chữ Hán của vật đã học, bỏ qua vật chưa học và id lạ", () => {
    let p = markDiscovered(emptyProgress(), progressKey(ROOM_SCENE.id, "cup"), 1);
    p = markDiscovered(p, progressKey(ROOM_SCENE.id, "cat"), 1);
    p = markDiscovered(p, progressKey(ROOM_SCENE.id, "khong-co"), 1);
    p = markDiscovered(p, progressKey("restaurant", "cup"), 1);
    expect(learnedTerms(p, [ROOM_SCENE])).toEqual(new Set(["杯子", "猫"]));
    expect(learnedTerms(emptyProgress(), [ROOM_SCENE]).size).toBe(0);
  });
});
