import { describe, expect, it } from "vitest";
import { parseSrt } from "./parse-srt";

describe("parseSrt", () => {
  it("đọc cue thường với mốc giờ:phút:giây,mili", () => {
    expect(parseSrt("1\n00:00:03,600 --> 00:00:08,016\nXin chào\n\n2\n00:01:02,5 --> 01:00:00,000\nTạm biệt\n")).toEqual([
      { text: "Xin chào", start: 3.6, end: 8.016 },
      { text: "Tạm biệt", start: 62.5, end: 3600 },
    ]);
  });
  it("chịu BOM, xuống dòng Windows, thiếu số thứ tự và cue nhiều dòng", () => {
    const srt = "﻿1\r\n00:00:00,000 --> 00:00:02,000\r\n你好，\r\n朋友。\r\n\r\n00:00:02,000 --> 00:00:04,000\r\n再见\r\n";
    expect(parseSrt(srt)).toEqual([{ text: "你好， 朋友。", start: 0, end: 2 }, { text: "再见", start: 2, end: 4 }]);
  });
  it("bỏ cue sai định dạng hoặc rỗng, file rỗng trả mảng rỗng", () => {
    expect(parseSrt("1\nkhông có mốc giờ\nnội dung\n\n2\n00:00:01,000 --> 00:00:02,000\n\n")).toEqual([]);
    expect(parseSrt("")).toEqual([]);
  });
});
