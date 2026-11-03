import { describe, expect, it } from "vitest";
import { buildCcSearchParams, isQuotaError, normalizeSearchQuery, parseSourcePatch } from "./video-discovery";

describe("normalizeSearchQuery", () => {
  it("gọn khoảng trắng và từ chối rỗng, quá dài, không phải chuỗi", () => {
    expect(normalizeSearchQuery("  中文   听力 ")).toBe("中文 听力");
    expect(normalizeSearchQuery("   ")).toBeNull();
    expect(normalizeSearchQuery("a".repeat(101))).toBeNull();
    expect(normalizeSearchQuery(42)).toBeNull();
  });
});

describe("buildCcSearchParams", () => {
  it("luôn lọc Creative Commons, có phụ đề, nhúng được", () => {
    const p = buildCcSearchParams("中文听力");
    expect(p).toMatchObject({ q: "中文听力", videoLicense: "creativeCommon", videoCaption: "closedCaption", videoEmbeddable: "true", type: "video", videoDuration: "medium" });
    expect(p.pageToken).toBeUndefined();
  });
  it("nhận thời lượng và pageToken", () => {
    expect(buildCcSearchParams("x", { duration: "long", pageToken: "abc" })).toMatchObject({ videoDuration: "long", pageToken: "abc" });
  });
});

describe("isQuotaError", () => {
  it("nhận lỗi hết hạn mức", () => {
    expect(isQuotaError(new Error("YouTube Data API search 403: The request cannot be completed because you have exceeded your quota."))).toBe(true);
    expect(isQuotaError(new Error("YouTube Data API search 500: boom"))).toBe(false);
  });
});

describe("parseSourcePatch", () => {
  it("nhận watching và licenseNote", () => {
    expect(parseSourcePatch({ watching: true })).toEqual({ watching: true });
    expect(parseSourcePatch({ licenseNote: "  CC BY  " })).toEqual({ licenseNote: "CC BY" });
  });
  it("ghi chú rỗng hoặc null nghĩa là xóa", () => {
    expect(parseSourcePatch({ licenseNote: "   " })).toEqual({ licenseNote: null });
    expect(parseSourcePatch({ licenseNote: null })).toEqual({ licenseNote: null });
  });
  it("từ chối kiểu sai, quá dài, hoặc không có gì để sửa", () => {
    expect(parseSourcePatch({ watching: "yes" })).toBeNull();
    expect(parseSourcePatch({ licenseNote: 5 })).toBeNull();
    expect(parseSourcePatch({ licenseNote: "x".repeat(301) })).toBeNull();
    expect(parseSourcePatch({})).toBeNull();
    expect(parseSourcePatch(null)).toBeNull();
    expect(parseSourcePatch({ title: "đổi tên" })).toBeNull();
  });
});
