import { describe, expect, it } from "vitest";
import { formatMeanings, prettifyMeaning } from "./format-meanings";

describe("formatMeanings", () => {
  it("tách lượng từ khỏi các ý nghĩa và đổi pinyin số sang dấu thanh", () => {
    const r = formatMeanings(["person", "CL:個|个[ge4],位[wei4]"]);
    expect(r.senses).toEqual(["person"]);
    expect(r.classifiers).toEqual([{ text: "个", pinyin: "gè" }, { text: "位", pinyin: "wèi" }]);
  });
  it("tham chiếu chéo phồn|giản[pinyin] chỉ giữ giản thể", () => {
    expect(prettifyMeaning("variant of 愛|爱[ai4]")).toBe("variant of 爱 (ài)");
    expect(prettifyMeaning("see 女[nu:3]")).toBe("see 女 (nǚ)");
  });
  it("pinyin số đứng một mình trong ngoặc vuông cũng được đổi", () => {
    expect(prettifyMeaning("also pr. [di4] or [di5] in songs")).toBe("also pr. (dì) or (di) in songs");
  });
  it("giữ nguyên ý không có ký hiệu đặc biệt", () => {
    expect(formatMeanings(["to love; to like"]).senses).toEqual(["to love; to like"]);
  });
});
