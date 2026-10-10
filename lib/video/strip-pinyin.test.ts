import { describe, expect, it } from "vitest";
import { stripPinyin, stripPinyinFromLines } from "./strip-pinyin";

describe("stripPinyin", () => {
  it("bỏ pinyin chen giữa các cụm chữ Hán", () => {
    expect(stripPinyin("Jīntiān fēnxiǎng ràng xiánliáo bù lěngchǎng de Zhōngwén biǎodá 今天分享 让闲聊不冷场的中文表达 Hái yǒu sì gè ràng duìhuà bùduàn de fāngfǎ 还有4个让对话不断的方法"))
      .toBe("今天分享 让闲聊不冷场的中文表达 还有4个让对话不断的方法");
  });

  it("bỏ cả cụm có từ không dấu (ya, de) và chữ cái lặp lại ngay trước pinyin", () => {
    expect(stripPinyin("Q, nǐ zhōumò zěnme guò de Q，你周末怎么过的 Jiù méi shénme shì zuò ya 就没什么事做呀")).toBe("Q，你周末怎么过的 就没什么事做呀");
  });

  it("dòng chỉ có pinyin thì rỗng", () => {
    expect(stripPinyin("Nǐ hǎo ma")).toBe("");
  });

  it("giữ nguyên câu tiếng Anh/Việt, tên riêng và pinyin không có dấu thanh", () => {
    expect(stripPinyin("In an hour we go 我们走吧")).toBe("In an hour we go 我们走吧");
    expect(stripPinyin("Xin chào các bạn")).toBe("Xin chào các bạn");
    expect(stripPinyin("你好 ni hao")).toBe("你好 ni hao");
  });

  it("bỏ dòng rỗng sau khi lọc", () => {
    const lines = [{ text: "nǐ hǎo", start: 0, end: 1 }, { text: "你好 nǐ hǎo", start: 1, end: 2 }];
    expect(stripPinyinFromLines(lines)).toEqual([{ text: "你好", start: 1, end: 2 }]);
  });
});
