import { describe, expect, it } from "vitest";
import { createGroqChat, rateLimitWaitSeconds } from "./groq-chat";

const ok = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }));
const req = { model: "openai/gpt-oss-120b", system: "s", user: "u" };

describe("rateLimitWaitSeconds", () => {
  it("ưu tiên header retry-after", () => expect(rateLimitWaitSeconds(new Headers({ "retry-after": "7" }), "")).toBe(7));
  it("đọc thời gian trong nội dung lỗi (giây, phút+giây)", () => {
    expect(rateLimitWaitSeconds(new Headers(), "Please try again in 5.5s.")).toBe(6);
    expect(rateLimitWaitSeconds(new Headers(), "try again in 0m30s")).toBe(30.5);
    expect(rateLimitWaitSeconds(new Headers(), "try again in 1m2s")).toBe(60); // vượt trần 60 giây
  });
  it("không có thông tin → 10 giây; giới hạn tối đa 60 giây", () => {
    expect(rateLimitWaitSeconds(new Headers(), "")).toBe(10);
    expect(rateLimitWaitSeconds(new Headers({ "retry-after": "900" }), "")).toBe(60);
  });
});

describe("createGroqChat", () => {
  it("gặp 429 thì chờ rồi thử lại", async () => {
    const waits: number[] = [];
    let calls = 0;
    const fetchFn = (async () => (++calls === 1 ? new Response("try again in 2s", { status: 429 }) : ok("{}"))) as typeof fetch;
    const out = await createGroqChat("k", fetchFn, async (ms) => { waits.push(ms); })(req);
    expect(out).toBe("{}");
    expect(waits).toEqual([2500]);
  });

  it("429 liên tục → ném lỗi sau số lần thử tối đa", async () => {
    let calls = 0;
    const fetchFn = (async () => { calls++; return new Response("x", { status: 429 }); }) as typeof fetch;
    await expect(createGroqChat("k", fetchFn, async () => {})(req)).rejects.toThrow("HTTP 429");
    expect(calls).toBe(4);
  });

  it("lỗi khác 429 không thử lại", async () => {
    let calls = 0;
    const fetchFn = (async () => { calls++; return new Response("bad", { status: 500 }); }) as typeof fetch;
    await expect(createGroqChat("k", fetchFn, async () => {})(req)).rejects.toThrow("HTTP 500");
    expect(calls).toBe(1);
  });
});
