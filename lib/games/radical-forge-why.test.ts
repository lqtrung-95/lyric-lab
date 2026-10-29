import { describe, expect, it } from "vitest";
import { forgeWhy } from "./radical-forge-why";

const labels: Record<string, { pinyin: string; meaning: string }> = {
  日: { pinyin: "rì", meaning: "mặt trời" }, 月: { pinyin: "yuè", meaning: "mặt trăng" }, 明: { pinyin: "míng", meaning: "sáng" },
  氵: { pinyin: "shuǐ", meaning: "nước" }, 青: { pinyin: "qīng", meaning: "xanh" }, 清: { pinyin: "qīng", meaning: "trong" },
};
const label = (c: string) => labels[c];

describe("forgeWhy", () => {
  it("hội ý: gộp nghĩa hai mảnh", () => {
    expect(forgeWhy("日", "月", "明", label, { type: "ideographic" })).toBe("Hội ý: ghép “日” (mặt trời) với “月” (mặt trăng) để gợi ra “明” (sáng).");
  });
  it("hình thanh: một mảnh chỉ nghĩa, một mảnh gợi âm", () => {
    expect(forgeWhy("氵", "青", "清", label, { type: "pictophonetic", semantic: "氵", phonetic: "青" })).toBe("Hình thanh: “氵” (nước) chỉ phần nghĩa, “青” gợi âm đọc (qīng gần với qīng), ghép lại thành “清” (trong).");
  });
  it("hình thanh nhưng dữ kiện không khớp hai mảnh thì rơi về hội ý; thiếu nghĩa thì bỏ ngoặc", () => {
    expect(forgeWhy("日", "月", "明", label, { type: "pictophonetic", semantic: "木", phonetic: "目" })).toContain("Hội ý");
    expect(forgeWhy("一", "二", "三", () => undefined, undefined)).toBe("Hội ý: ghép “一” với “二” để gợi ra “三”.");
  });
  it("không lồng ngoặc khi nghĩa của mảnh đã có ngoặc", () => {
    const label = (c: string) => (c === "氵" ? { pinyin: "shuǐ", meaning: "bộ thủy (nước)" } : c === "干" ? { pinyin: "gàn", meaning: "làm" } : { pinyin: "hàn", meaning: "mồ hôi" });
    expect(forgeWhy("氵", "干", "汗", label, { type: "pictophonetic", semantic: "氵", phonetic: "干" })).toContain("“氵” (bộ thủy, nước) chỉ phần nghĩa");
  });
});
