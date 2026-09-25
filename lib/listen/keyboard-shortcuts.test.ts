import { describe, expect, it } from "vitest";
import { resolveShortcut } from "./keyboard-shortcuts";

const press = (key: string, target: { tagName?: string; isContentEditable?: boolean } | null = { tagName: "BODY" }, mods = {}) =>
  resolveShortcut({ key, ctrlKey: false, metaKey: false, altKey: false, target, ...mods });

describe("resolveShortcut", () => {
  it("ánh xạ các phím", () => {
    expect(press(" ")).toBe("togglePlay");
    expect(press("ArrowLeft")).toBe("prevLine");
    expect(press("ArrowRight")).toBe("nextLine");
    expect(press("l")).toBe("toggleLoop");
    expect(press("L")).toBe("toggleLoop");
    expect(press("x")).toBeNull();
  });
  it("bỏ qua khi đang gõ hoặc focus ở select", () => {
    expect(press(" ", { tagName: "INPUT" })).toBeNull();
    expect(press("l", { tagName: "TEXTAREA" })).toBeNull();
    expect(press("ArrowLeft", { tagName: "SELECT" })).toBeNull();
    expect(press("l", { tagName: "DIV", isContentEditable: true })).toBeNull();
  });
  it("Space trên nút thì nút tự xử lý", () => {
    expect(press(" ", { tagName: "BUTTON" })).toBeNull();
    expect(press("ArrowRight", { tagName: "BUTTON" })).toBe("nextLine");
  });
  it("bỏ qua khi có phím bổ trợ", () => {
    expect(press("ArrowLeft", { tagName: "BODY" }, { metaKey: true })).toBeNull();
    expect(press("l", { tagName: "BODY" }, { ctrlKey: true })).toBeNull();
  });
});
