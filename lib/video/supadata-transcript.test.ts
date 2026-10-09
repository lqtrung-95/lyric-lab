import { describe, expect, it } from "vitest";
import { SupadataError, fetchSupadataChineseLines } from "./supadata-transcript";

const respond = (status: number, body?: unknown): typeof fetch => (async () => new Response(body === undefined ? null : JSON.stringify(body), { status })) as typeof fetch;

describe("fetchSupadataChineseLines", () => {
  it("đổi mili giây sang giây và gửi khóa trong header", async () => {
    let seen: { url: string; key: string | null } | null = null;
    const fetchFn = (async (input: URL, init?: RequestInit) => {
      seen = { url: String(input), key: new Headers(init?.headers).get("x-api-key") };
      return new Response(JSON.stringify({ lang: "zh", content: [{ text: " 你好 ", offset: 1500, duration: 2000, lang: "zh" }, { text: "", offset: 4000, duration: 1000 }] }), { status: 200 });
    }) as unknown as typeof fetch;
    expect(await fetchSupadataChineseLines("abcdefghijk", "KEY", fetchFn)).toEqual([{ text: "你好", start: 1.5, end: 3.5 }]);
    expect(seen!.key).toBe("KEY");
    expect(seen!.url).toContain("mode=native");
    expect(seen!.url).toContain("lang=zh");
  });

  it("không có phụ đề (206) hoặc ngôn ngữ không phải tiếng Trung thì trả rỗng", async () => {
    expect(await fetchSupadataChineseLines("abcdefghijk", "K", respond(206))).toEqual([]);
    expect(await fetchSupadataChineseLines("abcdefghijk", "K", respond(200, { lang: "en", content: [{ text: "hi", offset: 0, duration: 1 }] }))).toEqual([]);
  });

  it("lỗi khác ném SupadataError kèm mã HTTP", async () => {
    await expect(fetchSupadataChineseLines("abcdefghijk", "K", respond(402))).rejects.toMatchObject({ name: "SupadataError", status: 402 });
    await expect(fetchSupadataChineseLines("abcdefghijk", "K", respond(429))).rejects.toBeInstanceOf(SupadataError);
  });
});
