import { describe, expect, it } from "vitest";
import { TOOL_CATEGORIES, TOOLS } from "./tool-registry";

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
  it("mỗi công cụ thuộc một nhóm có thật và có ít nhất một công cụ 'dùng nhiều nhất'", () => {
    const ids = new Set(TOOL_CATEGORIES.map((c) => c.id));
    for (const t of TOOLS) expect(ids.has(t.category), t.href).toBe(true);
    expect(TOOLS.some((t) => t.popular)).toBe(true);
  });
});
