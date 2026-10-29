import { describe, expect, it } from "vitest";
import { sinoVietForWord } from "./sino-viet";

const table = new Map([["城", ["thành"]], ["市", ["thị"]], ["行", ["hành", "hạnh"]]]);

describe("sinoVietForWord", () => {
  it("ghép âm từng chữ", () => expect(sinoVietForWord("城市", table)).toBe("thành thị"));
  it("nhiều âm lấy âm đầu", () => expect(sinoVietForWord("行", table)).toBe("hành"));
  it("thiếu chữ trong bảng → null", () => expect(sinoVietForWord("城堡", table)).toBeNull());
  it("có ký tự không phải chữ Hán → null", () => expect(sinoVietForWord("A城", table)).toBeNull());
  it("chuỗi rỗng → null", () => expect(sinoVietForWord("", table)).toBeNull());
});

describe("sinoVietForWord, chữ có âm thông dụng ghi đè", () => {
  it("好 lấy âm hảo dù Unihan liệt kê hiếu trước", () => expect(sinoVietForWord("好", new Map([["好", ["hiếu", "hảo"]]]))).toBe("hảo"));
});

describe("sinoVietForWord, chữ Unihan thiếu", () => {
  const t = new Map([["情", ["tình"]], ["况", ["huống"]], ["要", ["yếu", "yêu"]]]);
  it("chữ phồn thể thiếu thì dùng chữ giản thể cùng vị trí (情況 ← 情况)", () => {
    expect(sinoVietForWord("情況", t)).toBeNull();
    expect(sinoVietForWord("情況", t, "情况")).toBe("tình huống");
  });
  it("chữ thiếu cả hai dạng thì lấy bảng bổ sung (需要 → nhu yếu)", () => {
    expect(sinoVietForWord("需要", t)).toBe("nhu yếu");
  });
  it("chữ khẩu ngữ không có âm Hán Việt thì vẫn null", () => {
    expect(sinoVietForWord("她", t)).toBeNull();
  });
  it("độ dài giản/phồn khác nhau thì không ghép theo vị trí", () => {
    expect(sinoVietForWord("情況", t, "情况况")).toBeNull();
  });
});
