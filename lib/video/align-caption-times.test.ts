import { describe, expect, it } from "vitest";
import { alignTimes, matchKey, parseJson3, textKey } from "./align-caption-times";

const cue = (start: number, end: number, text: string) => ({ start, end, text });

describe("parseJson3", () => {
  it("đổi ms sang giây, nối segs, bỏ sự kiện rỗng", () => {
    const out = parseJson3({ events: [{ tStartMs: 3633, dDurationMs: 2767, segs: [{ utf8: "今天" }, { utf8: "我想" }] }, { tStartMs: 9000, segs: [{ utf8: "\n" }] }, { tStartMs: 1 }, { tStartMs: 7000, dDurationMs: 500, segs: [{ utf8: "好" }] }] });
    expect(out).toEqual([cue(3.633, 6.4, "今天我想"), cue(7, 7.5, "好")]);
    expect(parseJson3(null)).toEqual([]);
  });
});

describe("alignTimes", () => {
  const cues = [cue(0, 2.733, "你好, 我是佳佳"), cue(3.633, 6.4, "今天我想试一下"), cue(6.4, 13.9, "只用HSK1的词汇")];
  it("câu một-một lấy mốc mili giây, giữ nguyên chữ", () => {
    const r = alignTimes([{ text: "你好, 我是佳佳", start: 0, end: 3 }, { text: "今天我想试一下", start: 3, end: 6 }, { text: "只用HSK1的词汇", start: 6, end: 14 }], cues);
    expect(r.lines.map((l) => [l.start, l.end])).toEqual([[0, 2.733], [3.633, 6.4], [6.4, 13.9]]);
    expect(r).toMatchObject({ matched: 3, ratio: 1, changed: 3 });
  });
  it("câu gộp từ nhiều cue lấy đầu cue đầu và cuối cue cuối", () => {
    const r = alignTimes([{ text: "你好我是佳佳今天我想试一下", start: 0, end: 6 }], cues);
    expect(r.lines[0]).toMatchObject({ start: 0, end: 6.4 });
    expect(r.matched).toBe(1);
  });
  it("bỏ qua cue không có trong bản đã lưu (như [音乐]) rồi vẫn căn tiếp", () => {
    const withNoise = [cue(0, 1, "[音乐]"), ...cues];
    const r = alignTimes([{ text: "你好, 我是佳佳", start: 0, end: 3 }], withNoise);
    expect(r.matched).toBe(1);
    expect(r.lines[0].end).toBe(2.733);
  });
  it("câu không khớp giữ mốc cũ; mốc mới lệch quá xa thì coi là khớp nhầm", () => {
    const r = alignTimes([{ text: "câu lạ không có", start: 1, end: 2 }, { text: "只用HSK1的词汇", start: 40, end: 50 }], cues);
    expect(r.lines.map((l) => [l.start, l.end])).toEqual([[1, 2], [40, 50]]);
    expect(r.matched).toBe(0);
  });
  it("cắt cuối câu không chồng sang đầu câu kế", () => {
    const r = alignTimes([{ text: "a", start: 0, end: 5 }, { text: "b", start: 5, end: 8 }], [cue(0, 6, "a"), cue(5.2, 8, "b")]);
    expect(r.lines[0].end).toBe(5.2);
  });
  it("phụ đề gốc có pinyin chen cùng dòng vẫn khớp câu chỉ có chữ Hán", () => {
    const withPinyin = [cue(8.433, 10.233, "huānyíng huídào wǒde píndào 欢迎 回到 我的 频道"), cue(10.433, 14.266, "jīntiān wǒ 今天 我 将 继续")];
    const r = alignTimes([{ text: "欢迎 回到 我的 频道", start: 8, end: 10 }, { text: "今天 我 将 继续", start: 10, end: 14 }], withPinyin);
    expect(r.matched).toBe(2);
    expect(r.lines.map((l) => [l.start, l.end])).toEqual([[8.433, 10.233], [10.433, 14.266]]);
  });
  it("cue không có chữ Hán (tiếng Anh) không bị lấy làm điểm bắt đầu", () => {
    const r = alignTimes([{ text: "你好", start: 1, end: 2 }], [cue(0.5, 0.9, "Hello everyone"), cue(1.2, 2.4, "你好")]);
    expect(r.lines[0]).toMatchObject({ start: 1.2, end: 2.4 });
  });
  it("matchKey: chữ Hán thì chỉ giữ chữ Hán, không có thì giữ chữ/số", () => {
    expect(matchKey("nǐ hǎo 你 好!")).toBe("你好");
    expect(matchKey("Hello, World!")).toBe("helloworld");
  });
  it("textKey bỏ dấu câu/khoảng trắng", () => {
    expect(textKey("你好, 我 是！")).toBe("你好我是");
  });
});
