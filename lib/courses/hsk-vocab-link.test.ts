import { describe, expect, it } from "vitest";
import { hskLevelOfSlug, hskVocabHref } from "./hsk-vocab-link";

describe("hskVocabHref", () => {
  it("khóa HSK 1–6 trỏ tới trang từ vựng của đúng cấp", () => {
    expect(hskLevelOfSlug("hsk-4")).toBe(4);
    expect(hskVocabHref("hsk-4")).toBe("/tu-vung-hsk/4");
    expect(hskVocabHref("hsk-1")).toBe("/tu-vung-hsk/1");
    expect(hskVocabHref("hsk-6")).toBe("/tu-vung-hsk/6");
  });
  it("khóa khác hoặc cấp ngoài 1–6 thì không có liên kết", () => {
    for (const s of ["", "hsk-7", "hsk-0", "hsk-12", "hsk-", "business-1", "xhsk-3"]) expect(hskVocabHref(s)).toBeNull();
  });
});
