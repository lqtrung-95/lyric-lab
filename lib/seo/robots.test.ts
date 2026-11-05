import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("chặn bot vào trang từ điển (có câu bài hát, mỗi trang dẫn sang rất nhiều trang khác) và API", () => {
    const rule = (robots().rules as { disallow: string[] }[])[0];
    expect(rule.disallow).toEqual(expect.arrayContaining(["/dictionary", "/learn/", "/api/"]));
  });
});
