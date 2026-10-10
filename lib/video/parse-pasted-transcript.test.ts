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

  it("bỏ nhãn đọc to của mốc giờ mà YouTube chèn vào (mọi ngôn ngữ), giữ lời", () => {
    const panel = "0:00\n0 seconds\n大家好\n25:57\n25 minutes, 57 seconds\n但是我觉得我做得越来越好了\n1:02:03\n1 giờ 2 phút 3 giây\n再见\n1:10:00\n1 giờ 10 phút\n结束";
    expect(parsePastedTranscript(panel, 4000).map((l) => l.text)).toEqual(["大家好", "但是我觉得我做得越来越好了", "再见", "结束"]);
  });

  it("câu có chứa số nhưng không trùng mốc giờ thì giữ nguyên", () => {
    const lines = parsePastedTranscript("0:05\n我们有3个人\n0:09\n5 个苹果\n");
    expect(lines.map((l) => l.text)).toEqual(["我们有3个人", "5 个苹果"]);
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

  it("vài dòng cuối nằm đầu bản chép (thứ tự trang YouTube sai): sắp lại theo mốc giờ, mốc kết thúc tính theo dòng kế tiếp", () => {
    const panel = "10:31\n在中超买了一些食材\n10:34\n又去买了零食\n0:23\n早上好我是佳佳\n0:28\n我刚刚送了女儿\n9:59\n好现在出发吧\n10:50\n赶紧把菜放进冰箱\n";
    const lines = parsePastedTranscript(panel, 700);
    expect(lines.map((l) => l.text)).toEqual(["早上好我是佳佳", "我刚刚送了女儿", "好现在出发吧", "在中超买了一些食材", "又去买了零食", "赶紧把菜放进冰箱"]);
    expect(lines.find((l) => l.text === "好现在出发吧")).toMatchObject({ start: 599, end: 631 });
    for (let i = 1; i < lines.length; i++) expect(lines[i].start).toBeGreaterThanOrEqual(lines[i - 1].end - 1e-9);
  });

  it("bản chép bị lặp cả lượt thì cắt phần lặp, không bị trộn lẫn khi sắp xếp", () => {
    const pass = "0:00\n你好大家\n0:05\n我是小明\n0:10\n很高兴认识你\n0:15\n再见\n";
    expect(parsePastedTranscript(pass + pass, 60).map((l) => l.text)).toEqual(["你好大家", "我是小明", "很高兴认识你", "再见"]);
  });
});
