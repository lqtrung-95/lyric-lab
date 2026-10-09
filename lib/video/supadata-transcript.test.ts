import { describe, expect, it } from "vitest";
import { SupadataError, fetchSupadataLines } from "./supadata-transcript";

const respond = (status: number, body?: unknown): typeof fetch => (async () => new Response(body === undefined ? null : JSON.stringify(body), { status })) as typeof fetch;

describe("fetchSupadataLines", () => {
  it("đổi mili giây sang giây, gửi khóa trong header và ngôn ngữ đã xin", async () => {
    let seen: { url: string; key: string | null } | null = null;
    const fetchFn = (async (input: URL, init?: RequestInit) => {
      seen = { url: String(input), key: new Headers(init?.headers).get("x-api-key") };
      return new Response(JSON.stringify({ lang: "zh", availableLangs: ["zh", "vi"], content: [{ text: " 你好 ", offset: 1500, duration: 2000, lang: "zh" }, { text: "", offset: 4000, duration: 1000 }] }), { status: 200 });
    }) as unknown as typeof fetch;
    expect(await fetchSupadataLines("abcdefghijk", "KEY", "zh", fetchFn)).toEqual({ lines: [{ text: "你好", start: 1.5, end: 3.5 }], availableLangs: ["zh", "vi"] });
    expect(seen!.key).toBe("KEY");
    expect(seen!.url).toContain("mode=native");
    expect(seen!.url).toContain("lang=zh");
  });

  it("không có phụ đề (206) hoặc ngôn ngữ trả về khác ngôn ngữ xin thì trả rỗng, vẫn báo các ngôn ngữ video có", async () => {
    expect(await fetchSupadataLines("abcdefghijk", "K", "zh", respond(206))).toEqual({ lines: [], availableLangs: [] });
    expect(await fetchSupadataLines("abcdefghijk", "K", "zh", respond(200, { lang: "en", availableLangs: ["en"], content: [{ text: "hi", offset: 0, duration: 1 }] }))).toEqual({ lines: [], availableLangs: ["en"] });
  });

  it("xin tiếng Việt thì nhận bản tiếng Việt", async () => {
    const out = await fetchSupadataLines("abcdefghijk", "K", "vi", respond(200, { lang: "vi", availableLangs: ["zh", "vi"], content: [{ text: "Xin chào", offset: 0, duration: 1000 }] }));
    expect(out.lines).toEqual([{ text: "Xin chào", start: 0, end: 1 }]);
  });

  it("lỗi khác ném SupadataError kèm mã HTTP", async () => {
    await expect(fetchSupadataLines("abcdefghijk", "K", "zh", respond(402))).rejects.toMatchObject({ name: "SupadataError", status: 402 });
    await expect(fetchSupadataLines("abcdefghijk", "K", "zh", respond(429))).rejects.toBeInstanceOf(SupadataError);
  });
});
