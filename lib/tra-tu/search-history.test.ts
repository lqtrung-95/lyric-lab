import { describe, expect, it } from "vitest";
import { parseHistory, pushHistory } from "./search-history";

describe("lịch sử tra", () => {
  it("thêm mới nhất lên đầu, bỏ trùng, giới hạn 12", () => {
    expect(pushHistory(["a", "b"], "b")).toEqual(["b", "a"]);
    const long = Array.from({ length: 12 }, (_, i) => `t${i}`);
    expect(pushHistory(long, "x")).toHaveLength(12);
    expect(pushHistory(long, "x")[0]).toBe("x");
  });
  it("bỏ qua chuỗi rỗng", () => {
    expect(pushHistory(["a"], "  ")).toEqual(["a"]);
  });
  it("đọc dữ liệu hỏng thì trả rỗng, lọc phần tử sai dạng", () => {
    expect(parseHistory("{oops")).toEqual([]);
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory('["好",3,"","ok"]')).toEqual(["好", "ok"]);
  });
});
