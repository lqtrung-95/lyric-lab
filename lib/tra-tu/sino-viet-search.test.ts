import { describe, expect, it } from "vitest";
import { buildSinoVietIndex, readsAs, sinoVietCandidates, sinoVietSyllables } from "./sino-viet-search";

const index = buildSinoVietIndex([
  { hanzi: "城", readings: ["thành", "nhật"] },
  { hanzi: "成", readings: ["thành"] },
  { hanzi: "市", readings: ["thị"] },
  { hanzi: "盛", readings: ["thịnh", "thành"] },
]);

describe("tìm theo Hán Việt", () => {
  it("không phân biệt dấu khi tra ngược âm", () => {
    expect(sinoVietSyllables(index, "thanh thi")).toEqual(["thanh", "thi"]);
    expect(index.byReading.get("thanh")).toEqual(["城", "成", "盛"]);
  });
  it("âm tiết không có trong bảng thì không tìm", () => {
    expect(sinoVietSyllables(index, "thanh xyz")).toBeNull();
    expect(sinoVietSyllables(index, "a b c d e")).toBeNull();
  });
  it("sinh các tổ hợp chữ ứng viên", () => {
    expect(sinoVietCandidates(index, ["thanh", "thi"])).toEqual(["城市", "成市", "盛市"]);
  });
  it("xác nhận từ đọc ra đúng chuỗi âm tiết, chấp nhận âm không phải âm đầu", () => {
    expect(readsAs(index, "城市", ["thanh", "thi"])).toBe(true);
    expect(readsAs(index, "盛市", ["thanh", "thi"])).toBe(true);
    expect(readsAs(index, "城", ["thanh", "thi"])).toBe(false);
  });
});
