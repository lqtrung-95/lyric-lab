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
