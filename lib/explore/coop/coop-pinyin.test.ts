import { describe, expect, it } from "vitest";
import { alignPinyin } from "@/lib/pinyin/align-ruby";
import { coopPinyinKeys } from "./coop-pinyin-keys";
import { coopPinyin } from "./coop-pinyin";

describe("pinyin của câu nói chơi chung", () => {
  it("mọi câu ghép, câu nói nhanh, nơi chốn và đồ vật đều có pinyin (nếu thiếu: chạy lại scripts/generate-coop-pinyin.mts)", () => {
    const missing = coopPinyinKeys().filter((k) => !coopPinyin(k));
    expect(missing, `thiếu ${missing.length} mục, ví dụ ${missing.slice(0, 3).join(" ")}`).toEqual([]);
  });

  it("pinyin căn được theo từng chữ Hán của câu (để hiện dưới từng chữ)", () => {
    const keys = coopPinyinKeys();
    const bad = keys.filter((k) => alignPinyin(k, coopPinyin(k)) === null);
    expect(bad.length / keys.length, `không căn được: ${bad.slice(0, 5).join(" ")}`).toBeLessThan(0.05);
  });
});
