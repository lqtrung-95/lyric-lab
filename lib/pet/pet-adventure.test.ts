import { describe, expect, it } from "vitest";
import type { SceneWord } from "@/lib/explore/explore-types";
import { ADVENTURE_MS, adventurePhase, canStartAdventure, minutesLeft, parseAdventure, pickAdventureScene, pickSouvenirWords, startAdventure } from "./pet-adventure";

const word = (term: string, pinyin = "p"): SceneWord => ({ id: term, term, gloss: "nghĩa", example: { zh: "", vi: "" }, x: 0, y: 0, w: 1, pinyin, sinoViet: null, hskLevel: null, examples: [] });
const trip = (now = 1000) => startAdventure({ sceneId: "cafe", title: "Quán cà phê", words: [word("拿铁")] }, "2026-10-29", now);

describe("chuyến đi", () => {
  it("đi một giờ rồi về, nhận xong thì done", () => {
    const a = trip(1000);
    expect(a.returnAt - a.startedAt).toBe(ADVENTURE_MS);
    expect(adventurePhase(a, 1000 + ADVENTURE_MS - 1)).toBe("away");
    expect(adventurePhase(a, 1000 + ADVENTURE_MS)).toBe("back");
    expect(adventurePhase({ ...a, taken: true }, 1000 + ADVENTURE_MS)).toBe("done");
  });
  it("đếm phút còn lại, làm tròn lên", () => {
    expect(minutesLeft(trip(0), 0)).toBe(60);
    expect(minutesLeft(trip(0), 59 * 60_000 + 1)).toBe(1);
    expect(minutesLeft(trip(0), ADVENTURE_MS * 2)).toBe(0);
  });
  it("chỉ được đi khi đạt mục tiêu và hôm nay chưa đi", () => {
    expect(canStartAdventure(false, null, "2026-10-29")).toBe(false);
    expect(canStartAdventure(true, null, "2026-10-29")).toBe(true);
    expect(canStartAdventure(true, trip(), "2026-10-29")).toBe(false);
    expect(canStartAdventure(true, trip(), "2026-10-30")).toBe(true);
  });
});

describe("chọn cảnh và quà", () => {
  it("cùng hạt giống thì cùng cảnh; không có cảnh thì null", () => {
    const ids = ["a", "b", "c", "d"];
    expect(pickAdventureScene(ids, "2026-10-29:cat")).toBe(pickAdventureScene(ids, "2026-10-29:cat"));
    expect(pickAdventureScene([], "x")).toBeNull();
  });
  it("chỉ lấy từ có pinyin, tối đa n từ khác nhau", () => {
    const words = [word("a"), word("b", ""), word("c"), word("d"), word("e")];
    const out = pickSouvenirWords(words, "seed", 3);
    expect(out).toHaveLength(3);
    expect(new Set(out.map((w) => w.term)).size).toBe(3);
    expect(out.every((w) => w.pinyin)).toBe(true);
    expect(pickSouvenirWords([word("x", "")], "s")).toEqual([]);
  });
});

describe("parseAdventure", () => {
  it("đọc lại đúng bản đã lưu và bỏ khối sai dạng", () => {
    const a = trip();
    expect(parseAdventure(JSON.parse(JSON.stringify(a)))).toEqual(a);
    expect(parseAdventure({ sceneId: "x" })).toBeNull();
    expect(parseAdventure(null)).toBeNull();
  });
});
