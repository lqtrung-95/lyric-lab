import { describe, expect, it } from "vitest";
import { TOOL_CATEGORIES, TOOLS } from "./tool-registry";

describe("TOOLS", () => {
  it("mỗi công cụ có đường dẫn riêng bắt đầu bằng / và không trùng, không nằm dưới /tools", () => {
    const hrefs = TOOLS.map((t) => t.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const h of hrefs) {
      expect(h.startsWith("/")).toBe(true);
      expect(h.startsWith("/tools")).toBe(false);
    }
  });
  it("tên và mô tả không rỗng", () => {
    for (const t of TOOLS) {
      expect(t.title.trim()).not.toBe("");
      expect(t.description.trim()).not.toBe("");
    }
  });
  it("mọi nhóm đều có ít nhất một công cụ và có tiêu đề, mô tả cho phần cách dùng", () => {
    for (const c of TOOL_CATEGORIES) {
      expect(TOOLS.some((t) => t.category === c.id), c.id).toBe(true);
      expect(c.heading.trim().length, c.id).toBeGreaterThan(3);
      expect(c.blurb.trim().length, c.id).toBeGreaterThan(10);
    }
  });
  it("tính năng trong app không bị đưa vào sơ đồ trang (inApp)", () => {
    expect(TOOLS.filter((t) => t.inApp).map((t) => t.href)).toEqual(["/courses/placement"]);
  });
  it("mỗi công cụ thuộc một nhóm có thật và có ít nhất một công cụ 'dùng nhiều nhất'", () => {
    const ids = new Set(TOOL_CATEGORIES.map((c) => c.id));
    for (const t of TOOLS) expect(ids.has(t.category), t.href).toBe(true);
    expect(TOOLS.some((t) => t.popular)).toBe(true);
  });
});
