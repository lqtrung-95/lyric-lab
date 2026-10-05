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
