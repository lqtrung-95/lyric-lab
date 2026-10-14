import { describe, expect, it } from "vitest";
import { cleanAsrLines, parseAsrJson, parseTimestamp, timingLooksBroken } from "./asr-lines";

describe("parseAsrJson", () => {
  it("đọc mảng, bỏ qua hàng hỏng và bỏ rào ```json", () => {
    const raw = '```json\n[{"start":1,"end":2,"text":"你好"},{"start":"x","end":2,"text":"hỏng"},null,{"start":3,"end":4}]\n```';
    expect(parseAsrJson(raw)).toEqual([{ start: 1, end: 2, text: "你好" }]);
  });
  it("nhận cả dạng {segments: [...]}", () => {
    expect(parseAsrJson('{"segments":[{"start":0,"end":1,"text":"好"}]}')).toHaveLength(1);
  });
  it("phân biệt đoạn không có lời ([]) với JSON hỏng (null)", () => {
    expect(parseAsrJson("[]")).toEqual([]);
    expect(parseAsrJson("không phải json")).toBeNull();
    expect(parseAsrJson('{"a":1}')).toBeNull();
  });
});

describe("parseTimestamp", () => {
  it("đọc số giây, MM:SS, H:MM:SS và giây thập phân", () => {
    expect(parseTimestamp(12.5)).toBe(12.5);
    expect(parseTimestamp("07:57")).toBe(477);
    expect(parseTimestamp("1:02:03")).toBe(3723);
    expect(parseTimestamp("00:07.5")).toBe(7.5);
    expect(parseTimestamp("45")).toBe(45);
  });
  it("từ chối giá trị không phải mốc giờ", () => {
    for (const bad of ["", "abc", "1:2:3:4", "-5", -5, NaN, null, undefined, "1:xx"]) expect(parseTimestamp(bad)).toBeNull();
  });
  it("parseAsrJson hiểu mốc giờ dạng chuỗi", () => {
    expect(parseAsrJson('[{"start":"00:32","end":"00:34","text":"机场空无一人"}]')).toEqual([{ start: 32, end: 34, text: "机场空无一人" }]);
  });
});

describe("timingLooksBroken", () => {
  const seg = (start: number, end: number, text = "这是一个正常的句子") => ({ start, end, text });
  it("đoạn bình thường không bị coi là hỏng", () => {
    const ok = Array.from({ length: 20 }, (_, i) => seg(i * 6, i * 6 + 5));
    expect(timingLooksBroken(ok, 126)).toBe(false);
  });
  it("hàng chục câu cách nhau 0,01 giây (mốc bị nén) bị phát hiện", () => {
    const squashed = Array.from({ length: 30 }, (_, i) => seg(477 + i * 0.01, 477.02 + i * 0.01));
    expect(timingLooksBroken(squashed, 252)).toBe(true);
  });
  it("lời chỉ nằm gọn trong vài giây của cửa sổ dài bị phát hiện, đoạn ít dòng thì bỏ qua", () => {
    const narrow = Array.from({ length: 10 }, (_, i) => seg(i * 1.5, i * 1.5 + 1.5, "短句"));
    expect(timingLooksBroken(narrow, 252)).toBe(true);
    expect(timingLooksBroken(narrow.slice(0, 3), 252)).toBe(false);
  });
});

describe("cleanAsrLines", () => {
  it("bỏ dòng không có chữ Hán, dòng rỗng và dòng quá dài", () => {
    const out = cleanAsrLines([
      { start: 0, end: 2, text: "你好" }, { start: 2, end: 4, text: "(music)" }, { start: 4, end: 5, text: "  " }, { start: 5, end: 6, text: "好".repeat(200) },
    ], 60);
    expect(out.map((l) => l.text)).toEqual(["你好"]);
  });
  it("gom câu lặp từ 3 lần liền nhau, giữ lặp 2 lần", () => {
    const rep = (n: number, text: string, from: number) => Array.from({ length: n }, (_, i) => ({ start: from + i * 2, end: from + i * 2 + 2, text }));
    expect(cleanAsrLines([...rep(4, "谢谢", 0), ...rep(2, "好的", 10)], 60).map((l) => l.text)).toEqual(["谢谢", "好的", "好的"]);
  });
  it("sắp theo giờ, cắt chồng lấn và ép trong độ dài video", () => {
    const out = cleanAsrLines([{ start: 5, end: 12, text: "第二句" }, { start: 0, end: 6, text: "第一句" }, { start: 58, end: 70, text: "最后" }], 60);
    expect(out.map((l) => l.text)).toEqual(["第一句", "第二句", "最后"]);
    expect(out[0].end).toBeLessThanOrEqual(out[1].start);
    expect(out[2].end).toBeLessThanOrEqual(60);
    for (const l of out) expect(l.end).toBeGreaterThan(l.start);
  });
  it("cho dòng quá ngắn đủ thời gian đọc", () => {
    const [line] = cleanAsrLines([{ start: 3, end: 3.1, text: "嗯好" }], 60);
    expect(line.end - line.start).toBeCloseTo(1, 1);
  });
  it("mốc giờ nguyên giây làm câu kết thúc sớm: kéo dài theo độ dài chữ nhưng không lấn sang câu kế", () => {
    const out = cleanAsrLines([{ start: 10, end: 11, text: "我现在整个人都犯困了" }, { start: 12, end: 13, text: "好" }], 60);
    expect(out[0].end).toBe(12); // 10 chữ → 3 giây, bị chặn ở đầu câu kế (12)
    const [single] = cleanAsrLines([{ start: 10, end: 11, text: "我现在整个人都犯困了" }], 60);
    expect(single.end).toBeCloseTo(13, 1);
  });
});
