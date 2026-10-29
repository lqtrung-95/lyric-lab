import { describe, expect, it } from "vitest";
import { progressKey, type ExploreProgress } from "./explore-progress";
import { MAX_SUGGESTIONS, scenesForSong, songTermSet, type SceneForMatch } from "./song-scenes";

const sc = (id: string, terms: string[]): SceneForMatch => ({ id, title: `Cảnh ${id}`, objects: terms.map((t, i) => ({ id: `o${i}`, term: t })) });
const learned = (sceneId: string, objId: string): ExploreProgress => ({ terms: { [progressKey(sceneId, objId)]: { discoveredAt: 1, lastSeenAt: 1, correct: 0, wrong: 0 } } });
const none: ExploreProgress = { terms: {} };

describe("songTermSet", () => {
  it("gộp mục học và từ chữ Hán trong lời, bỏ dấu câu và chữ khác", () => {
    const set = songTermSet([{ term: "烤串" }], [{ tokens: [{ text: "我" }, { text: "，" }, { text: "hello" }, { text: "夜市" }] }]);
    expect([...set].sort()).toEqual(["夜市", "我", "烤串"].sort());
  });
});

describe("scenesForSong", () => {
  const scenes = [sc("a", ["烤串", "夜市", "彩灯"]), sc("b", ["茶杯", "茶叶"]), sc("c", ["烤串", "茶杯", "夜市", "彩灯"])];
  it("chỉ mời cảnh có từ trùng đủ ngưỡng và liệt kê đúng từ trùng", () => {
    const m = scenesForSong(new Set(["烤串", "夜市", "茶杯"]), scenes, none);
    expect(m.map((x) => x.sceneId)).toEqual(["c", "a"]);
    expect(m[0].terms).toEqual(["烤串", "茶杯", "夜市"]);
  });
  it("một từ trùng đơn lẻ không đủ để mời", () => {
    expect(scenesForSong(new Set(["烤串"]), scenes, none)).toEqual([]);
  });
  it("ưu tiên cảnh còn nhiều từ chưa học; từ đã học không tính là chưa học", () => {
    const songTerms = new Set(["烤串", "夜市", "茶杯", "茶叶"]);
    const p = learned("c", "o0"); // đã học 烤串 ở cảnh c
    const m = scenesForSong(songTerms, scenes, p);
    const c = m.find((x) => x.sceneId === "c")!;
    expect(c.unlearned).toEqual(["茶杯", "夜市"]);
    expect(m[0].unlearned.length).toBeGreaterThanOrEqual(m[m.length - 1].unlearned.length);
  });
  it("giới hạn số gợi ý và bài không có từ nào thì rỗng", () => {
    const many = Array.from({ length: 8 }, (_, i) => sc(`s${i}`, ["烤串", "夜市"]));
    expect(scenesForSong(new Set(["烤串", "夜市"]), many, none)).toHaveLength(MAX_SUGGESTIONS);
    expect(scenesForSong(new Set(), scenes, none)).toEqual([]);
  });
});
