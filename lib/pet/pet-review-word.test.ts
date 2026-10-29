import { describe, expect, it } from "vitest";
import { peekReviewWords, pickReviewWord, reviewWordLabel } from "./pet-review-word";

const card = (term: string, meaning: string, pinyin: string | null = "p") => ({ term, pinyin, meaning });

describe("peekReviewWords", () => {
  it("lấy tối đa 3 thẻ đầu, bỏ thẻ thiếu chữ Hán hoặc nghĩa", () => {
    const out = peekReviewWords([card("", "x"), card("你好", "xin chào"), card("谢谢", ""), card("再见", "tạm biệt"), card("好", "tốt"), card("大", "to"), card("小", "nhỏ")]);
    expect(out.map((w) => w.term)).toEqual(["你好", "再见", "好"]);
  });
  it("làm sạch cụm dẫn nhập và cắt nghĩa dài", () => {
    const [w] = peekReviewWords([card("笨拙", 'Ở câu này mang nghĩa là "vụng về". Nó tự giễu.')]);
    expect(w.meaning).toBe("vụng về");
    const [long] = peekReviewWords([card("长", "a".repeat(80))]);
    expect([...long.meaning].length).toBe(40);
  });
  it("pinyin rỗng thành null", () => {
    expect(peekReviewWords([card("好", "tốt", "  ")])[0].pinyin).toBeNull();
  });
});

describe("pickReviewWord", () => {
  const words = peekReviewWords([card("你好", "xin chào"), card("再见", "tạm biệt")]);
  it("quay vòng qua các từ", () => {
    expect(pickReviewWord(words, 0)?.term).toBe("你好");
    expect(pickReviewWord(words, 1)?.term).toBe("再见");
    expect(pickReviewWord(words, 2)?.term).toBe("你好");
  });
  it("không có từ hoặc seed lạ", () => {
    expect(pickReviewWord([], 3)).toBeNull();
    expect(pickReviewWord(words, Number.NaN)?.term).toBe("你好");
  });
});

describe("reviewWordLabel", () => {
  it("có pinyin thì kèm trong ngoặc", () => {
    expect(reviewWordLabel({ term: "好", pinyin: "hǎo", meaning: "tốt" })).toBe("好 (hǎo): tốt. Bấm để nghe");
    expect(reviewWordLabel({ term: "好", pinyin: null, meaning: "tốt" })).toBe("好: tốt. Bấm để nghe");
  });
});
