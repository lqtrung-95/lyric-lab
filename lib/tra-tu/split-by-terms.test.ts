import { describe, expect, it } from "vitest";
import { splitByTerms } from "./split-by-terms";

describe("splitByTerms", () => {
  it("tô mọi lần xuất hiện và giữ nguyên phần còn lại", () => {
    expect(splitByTerms("我爱你，爱情", ["爱"])).toEqual([
      { text: "我", hit: false }, { text: "爱", hit: true }, { text: "你，", hit: false }, { text: "爱", hit: true }, { text: "情", hit: false },
    ]);
  });
  it("nhận cả dạng phồn thể, ưu tiên dạng dài hơn", () => {
    expect(splitByTerms("愛情很好", ["爱情", "愛情", "爱"]).map((s) => s.text)).toEqual(["愛情", "很好"]);
  });
  it("không có từ thì trả nguyên câu", () => {
    expect(splitByTerms("你好", [])).toEqual([{ text: "你好", hit: false }]);
  });
});
