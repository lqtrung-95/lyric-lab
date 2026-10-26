import { describe, expect, it } from "vitest";
import { basePinyin, checkPinyinInput, chunkSentence, parsePinyin, stripPunctuation } from "./quiz-extra";

describe("cắt câu để sắp xếp", () => {
  it("bỏ dấu câu và ghép lại đúng câu gốc; ưu tiên từ đã biết", () => {
    const chunks = chunkSentence("我喜欢吃面条。", ["喜欢", "面条"])!;
    expect(chunks).toEqual(["我", "喜欢", "吃", "面条"]);
    expect(chunks.join("")).toBe(stripPunctuation("我喜欢吃面条。"));
  });

  it("phần chưa biết cắt từng cặp chữ", () => {
    expect(chunkSentence("今天天气很好", [])).toEqual(["今天", "天气", "很好"]);
  });

  it("quá ngắn hoặc quá dài thì không ra bài", () => {
    expect(chunkSentence("你好!", [])).toBeNull();
    expect(chunkSentence("这是一个非常非常非常非常长的句子啊啊", [])).toBeNull();
  });
});

describe("pinyin", () => {
  it("tách phần chữ cái và danh sách thanh; ü thành v, bỏ khoảng trắng và dấu nháy", () => {
    expect(parsePinyin("cān yǐn")).toEqual({ base: "canyin", tones: "13" });
    expect(parsePinyin("nǚ ér")).toEqual({ base: "nver", tones: "32" });
    expect(parsePinyin("Xi'an")).toEqual({ base: "xian", tones: "" });
    expect(parsePinyin("can1 yin3")).toEqual({ base: "canyin", tones: "13" });
    expect(basePinyin("cān yǐn")).toBe("canyin");
  });

  it("đúng cả thanh: gõ dấu hoặc gõ số", () => {
    expect(checkPinyinInput("cān yǐn", "cān yǐn")).toBe("exact");
    expect(checkPinyinInput("can1 yin3", "cān yǐn")).toBe("exact");
    expect(checkPinyinInput("CAN1YIN3", "cān yǐn")).toBe("exact");
  });

  it("đúng âm nhưng chưa gõ thanh thì vẫn đúng ở mức toneless", () => {
    expect(checkPinyinInput("can yin", "cān yǐn")).toBe("toneless");
  });

  it("sai âm hoặc sai thanh thì sai; rỗng thì sai", () => {
    expect(checkPinyinInput("can yan", "cān yǐn")).toBe("wrong");
    expect(checkPinyinInput("can2 yin3", "cān yǐn")).toBe("wrong");
    expect(checkPinyinInput("", "cān yǐn")).toBe("wrong");
  });

  it("thanh nhẹ không cần số", () => {
    expect(checkPinyinInput("xi3huan", "xǐ huan")).toBe("exact");
    expect(checkPinyinInput("xi huan", "xǐ huan")).toBe("toneless");
  });
});
