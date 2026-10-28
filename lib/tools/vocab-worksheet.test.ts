import { describe, expect, it } from "vitest";
import { MAX_WORDS, buildMatch, canMatchMeaning, hanHint, letterOf, parseWordList, type VocabItem } from "./vocab-worksheet";

describe("đọc danh sách từ", () => {
  it("nhận từ kèm nghĩa với nhiều kiểu phân cách, bỏ trùng và dòng không phải chữ Hán", () => {
    const list = parseWordList("你好, xin chào\n谢谢 cảm ơn\n再见 - tạm biệt\n老师:giáo viên\n学生\t học sinh\nhello\n\n你好 trùng\n  水  ");
    expect(list).toEqual([
      { zh: "你好", meaning: "xin chào" }, { zh: "谢谢", meaning: "cảm ơn" }, { zh: "再见", meaning: "tạm biệt" },
      { zh: "老师", meaning: "giáo viên" }, { zh: "学生", meaning: "học sinh" }, { zh: "水", meaning: null },
    ]);
  });

  it("giữ tối đa số từ cho một tờ", () => {
    const many = Array.from({ length: 30 }, (_, i) => "一二三四五六七八九十"[i % 10] + "甲乙丙丁戊己庚辛壬癸"[Math.floor(i / 10)] + "子").join("\n");
    expect(parseWordList(many)).toHaveLength(MAX_WORDS);
  });
});

describe("bài nối", () => {
  it("cột phải khác thứ tự gốc và đáp án chỉ đúng chữ cái của từng dòng, với mọi bộ số ngẫu nhiên", () => {
    const rights = ["nǐ hǎo", "xiè xie", "zài jiàn", "lǎo shī"];
    for (const v of [0, 0.3, 0.99]) {
      const m = buildMatch(rights, () => v);
      expect(m.right).not.toEqual(rights);
      expect([...m.right].sort()).toEqual([...rights].sort());
      m.answers.forEach((letter, i) => expect(m.right[letter.charCodeAt(0) - 65]).toBe(rights[i]));
    }
    expect(letterOf(0)).toBe("A");
    expect(buildMatch(["a"]).right).toEqual(["a"]);
  });
});

describe("gợi ý và điều kiện làm bài", () => {
  const item = (meaning: string | null, sinoViet: string | null): VocabItem => ({ zh: "你", pinyin: "nǐ", meaning, sinoViet });
  it("chỉ nối chữ với nghĩa khi mọi từ đều có nghĩa; gợi ý ưu tiên nghĩa rồi Hán Việt", () => {
    expect(canMatchMeaning([item("bạn", null), item("tôi", null)])).toBe(true);
    expect(canMatchMeaning([item("bạn", null), item(null, "ngã")])).toBe(false);
    expect(hanHint(item("bạn", "nhĩ"))).toBe("bạn");
    expect(hanHint(item(null, "nhĩ"))).toBe("nhĩ");
    expect(hanHint(item(null, null))).toBe("");
  });
});
