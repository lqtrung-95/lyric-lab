import { describe, expect, it } from "vitest";
import { alignTranslations } from "./align-translation";

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
