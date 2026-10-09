import { describe, expect, it } from "vitest";
import { clampRate, defaultListenPrefs, formatRate, parseListenPrefs } from "./listen-prefs";

describe("parseListenPrefs", () => {
  it("mặc định khi rỗng hoặc hỏng", () => {
    expect(parseListenPrefs(null)).toEqual(defaultListenPrefs);
    expect(parseListenPrefs("{hỏng")).toEqual(defaultListenPrefs);
  });
  it("đọc giá trị hợp lệ, bỏ giá trị lạ", () => {
    expect(parseListenPrefs('{"showPinyin":false,"showTranslation":true,"rate":0.75,"autoScroll":false}')).toEqual({ showPinyin: false, showTranslation: true, rate: 0.75, autoScroll: false, playerSize: "medium" });
    expect(parseListenPrefs('{"showPinyin":"x","rate":3,"autoScroll":"x","playerSize":"huge"}')).toEqual(defaultListenPrefs);
  });
  it("nhận tốc độ lẻ trong khoảng 0,5x-2x (làm tròn bước 0,05), bỏ mức ngoài khoảng", () => {
    expect(parseListenPrefs('{"rate":1.35}').rate).toBe(1.35);
    expect(parseListenPrefs('{"rate":1.333}').rate).toBe(1.35);
    expect(parseListenPrefs('{"rate":2}').rate).toBe(2);
    expect(parseListenPrefs('{"rate":0.25}').rate).toBe(1);
    expect(parseListenPrefs('{"rate":3}').rate).toBe(1);
  });
  it("clampRate giữ trong khoảng và không sinh số lẻ dài; formatRate dùng dấu phẩy", () => {
    expect(clampRate(0.7 + 0.05)).toBe(0.75);
    expect(clampRate(5)).toBe(2);
    expect(clampRate(0.1)).toBe(0.5);
    expect(formatRate(1)).toBe("1x");
    expect(formatRate(1.25)).toBe("1,25x");
  });
  it("nhớ cỡ video hợp lệ", () => {
    expect(parseListenPrefs('{"playerSize":"small"}').playerSize).toBe("small");
    expect(parseListenPrefs('{"playerSize":"medium"}').playerSize).toBe("medium");
  });
});
