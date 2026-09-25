import { describe, expect, it } from "vitest";
import { defaultListenPrefs, parseListenPrefs } from "./listen-prefs";

describe("parseListenPrefs", () => {
  it("mặc định khi rỗng hoặc hỏng", () => {
    expect(parseListenPrefs(null)).toEqual(defaultListenPrefs);
    expect(parseListenPrefs("{hỏng")).toEqual(defaultListenPrefs);
  });
  it("đọc giá trị hợp lệ, bỏ giá trị lạ", () => {
    expect(parseListenPrefs('{"showPinyin":false,"showTranslation":true,"rate":0.75}')).toEqual({ showPinyin: false, showTranslation: true, rate: 0.75 });
    expect(parseListenPrefs('{"showPinyin":"x","rate":3}')).toEqual(defaultListenPrefs);
  });
});
