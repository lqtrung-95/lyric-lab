import { describe, expect, it } from "vitest";
import { parsePastedTranscript } from "./parse-pasted-transcript";

describe("parsePastedTranscript", () => {
  it("đọc SRT", () => {
    const srt = "1\n00:00:01,000 --> 00:00:03,500\n大家好\n\n2\n00:00:04,000 --> 00:00:06,000\n欢迎收听\n节目\n";
    expect(parsePastedTranscript(srt)).toEqual([
      { text: "大家好", start: 1, end: 3.5 },
      { text: "欢迎收听 节目", start: 4, end: 6 },
    ]);
  });

  it("đọc VTT (mốc không có giờ, bỏ thẻ định dạng và tiêu đề)", () => {
    const vtt = "WEBVTT\n\n00:01.000 --> 00:02.500\n<c>今天</c>天气好\n\n01:00:00.000 --> 01:00:02.000\n再见\n";
    expect(parsePastedTranscript(vtt)).toEqual([
      { text: "今天天气好", start: 1, end: 2.5 },
      { text: "再见", start: 3600, end: 3602 },
    ]);
  });

  it("đọc bảng Bản chép lời của YouTube: mốc một dòng, lời dòng sau", () => {
    const panel = "0:00\n大家好\n0:05\n欢迎收听\n我们的节目\n1:02:03\n再见\n";
    expect(parsePastedTranscript(panel, 3800)).toEqual([
      { text: "大家好", start: 0, end: 5 },
      { text: "欢迎收听 我们的节目", start: 5, end: 3723 },
      { text: "再见", start: 3723, end: 3728 },
    ]);
  });

  it("đọc dạng mốc và lời cùng một dòng; dòng cuối không vượt hết video", () => {
    expect(parsePastedTranscript("0:00 你好\n0:04 谢谢", 6)).toEqual([
      { text: "你好", start: 0, end: 4 },
      { text: "谢谢", start: 4, end: 6 },
    ]);
  });

  it("văn bản không có mốc giờ thì trả mảng rỗng", () => {
    expect(parsePastedTranscript("大家好\n欢迎收听")).toEqual([]);
    expect(parsePastedTranscript("")).toEqual([]);
  });

  it("cắt dòng quá dài và bỏ mốc không có lời", () => {
    const long = "字".repeat(500);
    const lines = parsePastedTranscript(`0:00\n${long}\n0:05\n`);
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toHaveLength(300);
  });
});
