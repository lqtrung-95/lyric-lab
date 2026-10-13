import { describe, expect, it } from "vitest";
import { TOOLS } from "./tool-registry";

describe("TOOLS", () => {
  it("mỗi công cụ có đường dẫn riêng bắt đầu bằng / và không trùng, không nằm dưới /cong-cu", () => {
    const hrefs = TOOLS.map((t) => t.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const h of hrefs) {
      expect(h.startsWith("/")).toBe(true);
      expect(h.startsWith("/cong-cu")).toBe(false);
    }
  });
  it("tên và mô tả không rỗng", () => {
    for (const t of TOOLS) {
      expect(t.title.trim()).not.toBe("");
      expect(t.description.trim()).not.toBe("");
    }
  });
});
