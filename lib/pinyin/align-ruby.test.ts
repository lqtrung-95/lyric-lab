import { describe, expect, it } from "vitest";
import { alignPinyin } from "./align-ruby";

describe("alignPinyin", () => {
  it("gán một âm tiết cho mỗi chữ Hán và bỏ qua dấu câu", () => {
    const r = alignPinyin("星期六,小红去动物园。", "xīng qī liù , xiǎo hóng qù dòng wù yuán 。");
    expect(r).toEqual(["xīng", "qī", "liù", "", "xiǎo", "hóng", "qù", "dòng", "wù", "yuán", ""]);
  });

  it("chữ 儿 là âm 'r' và dấu hai chấm khác loại vẫn khớp", () => {
    expect(alignPinyin("在哪儿?", "zài nǎ r ?")).toEqual(["zài", "nǎ", "r", ""]);
    expect(alignPinyin("有:三个", "yǒu : sān gè")).toEqual(["yǒu", "", "sān", "gè"]);
    expect(alignPinyin("他说:“好!”", "tā shuō : “ hǎo ! ”")).toEqual(["tā", "shuō", "", "", "hǎo", "", ""]);
  });

  it("dấu câu không có token trong pinyin vẫn không làm lệch", () => {
    expect(alignPinyin("你好!我", "nǐ hǎo wǒ")).toEqual(["nǐ", "hǎo", "", "wǒ"]);
  });

  it("lệch số âm tiết hoặc thiếu pinyin thì trả null", () => {
    expect(alignPinyin("你好吗", "nǐ hǎo")).toBeNull();
    expect(alignPinyin("你好", "nǐ hǎo ma")).toBeNull();
    expect(alignPinyin("你好", undefined)).toBeNull();
  });
});
