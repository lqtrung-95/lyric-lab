import { describe, expect, it } from "vitest";
import { isNavActive } from "./nav-links";

describe("isNavActive", () => {
  it("trang chủ của app (/app) chỉ active ở chính nó, không phải ở landing hay mục khác", () => {
    expect(isNavActive("/app", "/app")).toBe(true);
    expect(isNavActive("/app", "/")).toBe(false);
    expect(isNavActive("/app", "/library")).toBe(false);
    expect(isNavActive("/app", "/application")).toBe(false);
  });
  it("Thi đấu active ở hub và ở phòng cụ thể", () => {
    expect(isNavActive("/room", "/room")).toBe(true);
    expect(isNavActive("/room", "/room/842915")).toBe(true);
    expect(isNavActive("/room", "/roommates")).toBe(false);
  });
  it("mục khác active ở chính nó và trang con", () => {
    expect(isNavActive("/library", "/library")).toBe(true);
    expect(isNavActive("/library", "/library/x")).toBe(true);
    expect(isNavActive("/library", "/libraryx")).toBe(false);
  });
});

import { ACCOUNT_LINKS, SECONDARY_LINKS, SIDE_GROUPS } from "./nav-links";

describe("nhóm lối vào phụ", () => {
  it("mọi lối vào phụ nằm đúng một nơi: một nhóm ở thanh bên hoặc menu avatar", () => {
    const placed = [...SIDE_GROUPS.flatMap((g) => g.links), ...ACCOUNT_LINKS].map((l) => l.href);
    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual(SECONDARY_LINKS.map((l) => l.href).sort());
  });
  it("mỗi nhóm có tiêu đề và ít nhất hai mục (nhóm một mục thì gộp vào nơi khác, không lập nhóm riêng)", () => {
    for (const g of SIDE_GROUPS) { expect(g.title.length).toBeGreaterThan(0); expect(g.links.length, g.id).toBeGreaterThanOrEqual(2); }
  });
});
