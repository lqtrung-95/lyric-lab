import { describe, expect, it } from "vitest";
import { compareDictation, detectTypedMode, dictationLines, expectedUnits, isPassing } from "./dictation";
import type { LessonLine } from "./video-lesson-types";

const line = (text: string, pinyin: string): LessonLine => ({ idx: 0, start: 0, end: 4, text, pinyin, translation: null, tokens: [{ text }] });
// Câu hư cấu: "你好，朋友。"
const hello = line("你好，朋友。", "nǐ hǎo ， péng you 。");

describe("dictationLines", () => {
  it("bỏ dòng có ít hơn 3 chữ Hán", () => {
    const keep = line("今天天气很好", "jīn tiān tiān qì hěn hǎo");
    expect(dictationLines([line("好的", "hǎo de"), keep, line("OK!", "OK !")])).toEqual([keep]);
  });
});

describe("expectedUnits", () => {
  it("chế độ chữ Hán chỉ lấy chữ Hán", () => expect(expectedUnits(hello, "hanzi")).toEqual(["你", "好", "朋", "友"]));
  it("chế độ pinyin lấy âm tiết của chữ Hán, bỏ dấu câu", () => expect(expectedUnits(hello, "pinyin")).toEqual(["nǐ", "hǎo", "péng", "you"]));
  it("pinyin lệch số chữ thì quay về các âm tiết không phải dấu câu", () => {
    expect(expectedUnits(line("你好朋友", "nǐ hǎo ， péng you"), "pinyin")).toEqual(["nǐ", "hǎo", "péng", "you"]);
  });
});

describe("compareDictation (pinyin)", () => {
  const statuses = (typed: string) => compareDictation(typed, hello, "pinyin").units.map((u) => u.status);
  it("đúng khi gõ có dấu, có hoặc không khoảng trắng", () => {
    expect(statuses("nǐ hǎo péng you")).toEqual(["correct", "correct", "correct", "correct"]);
    expect(statuses("nǐhǎopéngyou")).toEqual(["correct", "correct", "correct", "correct"]);
  });
  it("đúng khi gõ số thanh; thanh nhẹ gõ 5 hoặc bỏ trống đều được", () => {
    expect(statuses("ni3 hao3 peng2 you5")).toEqual(["correct", "correct", "correct", "correct"]);
    expect(statuses("ni3hao3peng2you")).toEqual(["correct", "correct", "correct", "correct"]);
  });
  it("câu nhiều âm tiết: gõ số thanh đúng được 100%, gõ không thanh chỉ nửa điểm", () => {
    const greeting = line("大家好我是雯", "dà jiā hǎo wǒ shì wén");
    expect(compareDictation("da4 jia1 hao3 wo3 shi4 wen2", greeting, "pinyin").score).toBe(1);
    expect(compareDictation("da4jia1hao3wo3shi4wen2", greeting, "pinyin").score).toBe(1);
    expect(compareDictation("da jia hao wo shi wen", greeting, "pinyin").score).toBe(0.5);
  });
  it("không gõ thanh hoặc sai thanh tính là 'tone' (nửa điểm), sai chữ cái là 'wrong'", () => {
    expect(statuses("ni hao peng you")).toEqual(["tone", "tone", "tone", "correct"]);
    expect(statuses("ni2 hao3 peng2 you")).toEqual(["tone", "correct", "correct", "correct"]);
    expect(statuses("ni hao pang you")).toEqual(["tone", "tone", "wrong", "correct"]);
  });
  it("ü gõ thành v hoặc u đều được", () => {
    const l = line("女朋友吧", "nǚ péng you ba");
    expect(compareDictation("nv peng you ba", l, "pinyin").units[0].status).toBe("tone");
    expect(compareDictation("nǚ péng you ba", l, "pinyin").units[0].status).toBe("correct");
  });
  it("gõ thiếu thì các âm tiết cuối là 'missing'; gõ thừa tính vào extra", () => {
    expect(statuses("ni hao")).toEqual(["tone", "tone", "missing", "missing"]);
    expect(compareDictation("ni hao peng you ma", hello, "pinyin").extra).toBe(1);
  });
  it("điểm: đúng hết 1, thiếu thanh 0.5, rỗng 0; isPassing cho phép thiếu thanh nhưng không cho sai chữ", () => {
    expect(compareDictation("nǐ hǎo péng you", hello, "pinyin").score).toBe(1);
    expect(compareDictation("ni hao peng you", hello, "pinyin").score).toBe(0.625); // 3 âm tiết thiếu thanh (0.5) + 1 đúng
    expect(compareDictation("", hello, "pinyin").score).toBe(0);
    expect(isPassing(compareDictation("ni hao peng you", hello, "pinyin"))).toBe(true);
    expect(isPassing(compareDictation("ni hao", hello, "pinyin"))).toBe(false);
  });
});

describe("compareDictation (chữ Hán)", () => {
  it("đúng hết, bỏ qua dấu câu và khoảng trắng", () => {
    const r = compareDictation("你好 朋友!", hello, "hanzi");
    expect(r.units.every((u) => u.status === "correct")).toBe(true);
    expect(r.score).toBe(1);
  });
  it("thiếu một chữ không làm sai các chữ sau", () => {
    const r = compareDictation("你朋友", hello, "hanzi");
    expect(r.units.map((u) => u.status)).toEqual(["correct", "wrong", "correct", "correct"]);
    expect(r.extra).toBe(0);
  });
  it("gõ sai một chữ: chữ đó sai, thừa một chữ", () => {
    const r = compareDictation("你号朋友", hello, "hanzi");
    expect(r.units.map((u) => u.status)).toEqual(["correct", "wrong", "correct", "correct"]);
    expect(r.extra).toBe(1);
    expect(isPassing(r)).toBe(false);
  });
  it("chưa gõ gì thì toàn 'missing'", () => {
    expect(compareDictation("", hello, "hanzi").units.every((u) => u.status === "missing")).toBe(true);
  });
});

describe("detectTypedMode", () => {
  it("có chữ Hán thì chấm theo chữ Hán, pinyin hoặc ô trống thì chấm theo pinyin", () => {
    expect(detectTypedMode("你好")).toBe("hanzi");
    expect(detectTypedMode("ni3 hao3 朋友")).toBe("hanzi");
    expect(detectTypedMode("nǐ hǎo")).toBe("pinyin");
    expect(detectTypedMode("")).toBe("pinyin");
  });
});
