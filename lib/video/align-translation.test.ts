import { describe, expect, it } from "vitest";
import { alignTranslations, isUsableTranslationTrack, straddleShare } from "./align-translation";

const line = (text: string, start: number, end: number) => ({ text, start, end });

describe("alignTranslations", () => {
  it("ghép từng dòng khi hai track cùng mốc", () => {
    const zh = [line("甲", 0, 2), line("乙", 2, 4)];
    const vi = [line("một", 0, 2), line("hai", 2, 4)];
    expect(alignTranslations(zh, vi)).toEqual(["một", "hai"]);
  });
  it("dòng dịch chồng lên hai dòng thì thuộc dòng chồng nhiều hơn", () => {
    const zh = [line("甲", 0, 2), line("乙", 2, 4)];
    expect(alignTranslations(zh, [line("hai", 1.5, 4)])).toEqual([null, "hai"]);
  });
  it("nhiều dòng dịch vào cùng một dòng thì nối theo thứ tự", () => {
    const zh = [line("甲", 0, 4)];
    expect(alignTranslations(zh, [line("một", 0, 2), line("hai", 2, 4)])).toEqual(["một hai"]);
  });
  it("dòng dịch không chồng lên dòng nào bị bỏ, dòng tiếng Trung không có dịch là null", () => {
    const zh = [line("甲", 0, 2), line("乙", 5, 7)];
    expect(alignTranslations(zh, [line("lạc", 3, 4), line("hai", 5, 7)])).toEqual([null, "hai"]);
  });
  it("bỏ dòng dịch rỗng và chuẩn hóa khoảng trắng", () => {
    expect(alignTranslations([line("甲", 0, 2)], [line("  ", 0, 1), line("a\n b", 1, 2)])).toEqual(["a b"]);
  });
  it("không có track dịch thì toàn null", () => {
    expect(alignTranslations([line("甲", 0, 2)], [])).toEqual([null]);
  });
});

describe("isUsableTranslationTrack", () => {
  it("nhận khi số dòng cùng cỡ và phần lớn dòng ghép được", () => {
    expect(isUsableTranslationTrack(100, 95, 90)).toBe(true);
    expect(isUsableTranslationTrack(100, 150, 80)).toBe(true);
  });
  it("từ chối khi số dòng lệch quá nhiều", () => {
    expect(isUsableTranslationTrack(100, 30, 30)).toBe(false);
    expect(isUsableTranslationTrack(100, 260, 95)).toBe(false);
  });
  it("từ chối khi ghép được quá ít dòng tiếng Trung", () => {
    expect(isUsableTranslationTrack(100, 100, 60)).toBe(false);
  });
  it("từ chối khi một trong hai bên rỗng", () => {
    expect(isUsableTranslationTrack(0, 10, 0)).toBe(false);
    expect(isUsableTranslationTrack(10, 0, 0)).toBe(false);
  });
});

describe("straddleShare", () => {
  const zh = [line("甲", 0, 2), line("乙", 2, 4), line("丙", 4, 6), line("丁", 6, 8)];
  it("hai track cùng cách chia câu thì không có dòng vắt ngang", () => {
    expect(straddleShare(zh, [line("a", 0, 2), line("b", 2, 4), line("c", 4, 6), line("d", 6, 8)])).toBe(0);
  });
  it("dòng dịch nằm gọn trong dòng tiếng Trung (chia nhỏ hơn) vẫn không tính là vắt ngang", () => {
    expect(straddleShare(zh, [line("a", 0, 1), line("b", 1, 2), line("c", 2, 3), line("d", 3, 4)])).toBe(0);
  });
  it("dòng dịch chia câu lệch (nửa nọ nửa kia) là vắt ngang", () => {
    const shifted = [line("a", 1, 3), line("b", 3, 5), line("c", 5, 7), line("d", 7, 8)];
    expect(straddleShare(zh, shifted)).toBeGreaterThanOrEqual(0.75);
  });
  it("bỏ qua dòng rỗng hoặc không có thời lượng; không có dòng nào thì 0", () => {
    expect(straddleShare(zh, [line("  ", 0, 2), line("x", 3, 3)])).toBe(0);
    expect(straddleShare(zh, [])).toBe(0);
  });
});

describe("isUsableTranslationTrack với độ vắt ngang", () => {
  it("track số dòng và độ phủ đạt nhưng vắt ngang nhiều thì bị loại", () => {
    expect(isUsableTranslationTrack(100, 100, 95, 0.1)).toBe(true);
    expect(isUsableTranslationTrack(100, 100, 95, 0.4)).toBe(false);
  });
});
