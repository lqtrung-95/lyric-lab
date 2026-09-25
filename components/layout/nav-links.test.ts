import { describe, expect, it } from "vitest";
import { isNavActive } from "./nav-links";

describe("isNavActive", () => {
  it("trang chủ chỉ active ở đúng '/'", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/", "/library")).toBe(false);
  });
  it("mục khác active ở chính nó và trang con", () => {
    expect(isNavActive("/library", "/library")).toBe(true);
    expect(isNavActive("/library", "/library/x")).toBe(true);
    expect(isNavActive("/library", "/libraryx")).toBe(false);
  });
});
