import { describe, expect, it } from "vitest";
import { buildRoomLink, generateRoomCode, normalizeRoomCode } from "./room-code";

describe("generateRoomCode", () => {
  it("luôn là 6 chữ số, không bắt đầu bằng 0", () => {
    for (let i = 0; i < 200; i++) expect(generateRoomCode()).toMatch(/^[1-9]\d{5}$/);
  });
  it("lấy số từ nguồn ngẫu nhiên truyền vào trong khoảng [100000, 1000000)", () => {
    let seen: [number, number] = [0, 0];
    expect(generateRoomCode((min, max) => ((seen = [min, max]), 123456))).toBe("123456");
    expect(seen).toEqual([100000, 1000000]);
  });
});

describe("normalizeRoomCode", () => {
  it("nhận mã sạch, mã có dấu cách hoặc gạch ngang", () => {
    expect(normalizeRoomCode("842915")).toBe("842915");
    expect(normalizeRoomCode(" 842 915 ")).toBe("842915");
    expect(normalizeRoomCode("842-915")).toBe("842915");
  });
  it("rút mã từ link mời", () => {
    expect(normalizeRoomCode("https://songhanzi.app/room/842915")).toBe("842915");
    expect(normalizeRoomCode("https://songhanzi.app/room/842915?utm=zalo")).toBe("842915");
    expect(normalizeRoomCode("/room/842915/")).toBe("842915");
  });
  it("từ chối mã sai độ dài, có chữ, bắt đầu bằng 0 hoặc link không có mã", () => {
    for (const bad of ["", "12345", "1234567", "84291a", "042915", "https://songhanzi.app/room/abc", "https://songhanzi.app/room/84291"]) {
      expect(normalizeRoomCode(bad)).toBeNull();
    }
  });
});

describe("buildRoomLink", () => {
  it("ghép gốc trang và mã, bỏ dấu / thừa", () => {
    expect(buildRoomLink("https://songhanzi.app", "842915")).toBe("https://songhanzi.app/room/842915");
    expect(buildRoomLink("https://songhanzi.app/", "842915")).toBe("https://songhanzi.app/room/842915");
  });
});
