import { describe, expect, it, vi } from "vitest";
import { createGeminiChat, parseGeminiKeys } from "./gemini-chat";

const K1 = "AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1";
const K2 = "AIzaSyBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB2";
const K3 = "AIzaSyCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC3";
const req = { model: "gemini-2.5-flash-lite", system: "SYS", user: "USER", maxTokens: 300 };
const ok = (text: string) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
const status = (code: number, body = "") => new Response(body, { status: code });

/** fetch giả: mỗi lần gọi lấy kết quả kế tiếp (hàm nhận khóa để biết khóa nào đang được dùng). */
function fakeFetch(steps: ((key: string) => Response | Promise<Response>)[]) {
  const calls: { url: string; key: string; body: Record<string, unknown> }[] = [];
  const fetchFn = vi.fn(async (url: string | URL, init?: RequestInit) => {
    const key = new Headers(init?.headers).get("x-goog-api-key") ?? "";
    calls.push({ url: String(url), key, body: JSON.parse(String(init?.body)) });
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    return step(key);
  }) as unknown as typeof fetch;
  return { random: () => 0, fetchFn, calls };
}

describe("parseGeminiKeys", () => {
  it("tách theo dấu phẩy, chấm phẩy, khoảng trắng và xuống dòng; bỏ khóa trùng và chuỗi quá ngắn", () => {
    expect(parseGeminiKeys(`${K1}, ${K2}\n${K3};${K1}  short`)).toEqual([K1, K2, K3]);
    expect(parseGeminiKeys(undefined)).toEqual([]);
    expect(parseGeminiKeys("")).toEqual([]);
  });
});

describe("createGeminiChat", () => {
  it("gửi đúng yêu cầu (khóa trong header, system tách riêng, JSON, giới hạn token) và trả về văn bản", async () => {
    const { fetchFn, calls } = fakeFetch([() => ok('{"a":1}')]);
    const chat = createGeminiChat([K1], { random: () => 0, fetchFn });
    expect(await chat(req)).toBe('{"a":1}');
    expect(calls[0].url).toContain("/models/gemini-2.5-flash-lite:generateContent");
    expect(calls[0].key).toBe(K1);
    expect(calls[0].body).toMatchObject({
      systemInstruction: { parts: [{ text: "SYS" }] },
      contents: [{ role: "user", parts: [{ text: "USER" }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } },
    });
  });

  it("model không thuộc Gemini 2.5 Flash thì không gửi cấu hình tắt suy nghĩ", async () => {
    const { fetchFn, calls } = fakeFetch([() => ok("{}")]);
    await createGeminiChat([K1], { random: () => 0, fetchFn })({ ...req, model: "gemini-3-pro" });
    expect((calls[0].body.generationConfig as Record<string, unknown>).thinkingConfig).toBeUndefined();
  });

  it("xoay vòng các khóa qua các lần gọi liên tiếp", async () => {
    const { fetchFn, calls } = fakeFetch([() => ok("{}")]);
    const chat = createGeminiChat([K1, K2, K3], { random: () => 0, fetchFn });
    for (let i = 0; i < 4; i++) await chat(req);
    expect(calls.map((c) => c.key)).toEqual([K1, K2, K3, K1]);
  });

  it("khóa bị 429 thì chuyển ngay sang khóa kế tiếp trong cùng một lần gọi", async () => {
    const { fetchFn, calls } = fakeFetch([() => status(429, "quota exceeded"), () => ok('{"ok":true}')]);
    expect(await createGeminiChat([K1, K2], { random: () => 0, fetchFn })(req)).toBe('{"ok":true}');
    expect(calls.map((c) => c.key)).toEqual([K1, K2]);
  });

  it("khóa vừa bị 429 được nghỉ 60 giây: lần gọi sau bỏ qua nó, hết thời gian nghỉ thì dùng lại", async () => {
    let t = 1_000_000;
    const { fetchFn, calls } = fakeFetch([(k) => (k === K1 && calls.length === 1 ? status(429) : ok("{}"))]);
    const chat = createGeminiChat([K1, K2], { random: () => 0, fetchFn, now: () => t });
    await chat(req); // K1 → 429, K2 → ok
    await chat(req); // con trỏ trỏ K2
    await chat(req); // con trỏ trỏ K1 nhưng đang nghỉ → dùng K2
    expect(calls.slice(2).map((c) => c.key)).toEqual([K2, K2]);
    t += 61_000;
    await chat(req); // con trỏ trỏ K2
    await chat(req); // con trỏ trỏ K1, đã hết nghỉ
    expect(calls.at(-1)!.key).toBe(K1);
  });

  it("hạn mức theo ngày thì nghỉ lâu hơn (15 phút)", async () => {
    let t = 0;
    const { fetchFn, calls } = fakeFetch([(k) => (calls.length === 1 && k === K1 ? status(429, "Quota exceeded: GenerateRequestsPerDayPerProjectPerModel") : ok("{}"))]);
    const chat = createGeminiChat([K1, K2], { random: () => 0, fetchFn, now: () => t });
    await chat(req);
    t += 61_000;
    for (let i = 0; i < 4; i++) await chat(req);
    expect(calls.slice(2).every((c) => c.key === K2)).toBe(true); // sau 61 giây K1 vẫn còn nghỉ
  });

  it("mọi khóa đều bị 429 thì ném lỗi để bộ định tuyến chuyển model", async () => {
    const { fetchFn, calls } = fakeFetch([() => status(429)]);
    await expect(createGeminiChat([K1, K2], { random: () => 0, fetchFn })(req)).rejects.toThrow("Gemini 429");
    expect(calls).toHaveLength(2);
  });

  it("khóa bị từ chối (401/403) thì sang khóa khác", async () => {
    const { fetchFn, calls } = fakeFetch([() => status(403), () => ok("{}")]);
    await createGeminiChat([K1, K2], { random: () => 0, fetchFn })(req);
    expect(calls.map((c) => c.key)).toEqual([K1, K2]);
  });

  it("lỗi 5xx hoặc lỗi mạng thì thử khóa khác", async () => {
    const { fetchFn, calls } = fakeFetch([() => status(503), () => { throw new Error("network down"); }, () => ok("{}")]);
    expect(await createGeminiChat([K1, K2, K3], { random: () => 0, fetchFn })(req)).toBe("{}");
    expect(calls).toHaveLength(3);
  });

  it("lỗi 400/404 (sai yêu cầu hoặc tên model) giống nhau với mọi khóa nên dừng ngay, không thử khóa khác", async () => {
    const { fetchFn, calls } = fakeFetch([() => status(404, "model not found")]);
    await expect(createGeminiChat([K1, K2], { random: () => 0, fetchFn })(req)).rejects.toThrow("Gemini 404");
    expect(calls).toHaveLength(1);
  });

  it("trả rỗng (bị chặn an toàn) thì ném lỗi, không thử khóa khác", async () => {
    const { fetchFn, calls } = fakeFetch([() => new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }), { status: 200 })]);
    await expect(createGeminiChat([K1, K2], { random: () => 0, fetchFn })(req)).rejects.toThrow("SAFETY");
    expect(calls).toHaveLength(1);
  });

  it("một lần gọi thử tối đa 5 khóa còn sống (nhiều khóa hơn thì không thử hết)", async () => {
    const { fetchFn, calls } = fakeFetch([() => status(429)]);
    const keys = Array.from({ length: 46 }, (_, i) => `AIzaSy${String(i).padStart(2, "0")}${"X".repeat(33)}`);
    await expect(createGeminiChat(keys, { random: () => 0, fetchFn })(req)).rejects.toThrow("đã thử 5 khóa");
    expect(calls).toHaveLength(5);
  });

  it("46 khóa: các lần gọi liên tiếp dùng 46 khóa khác nhau, rồi quay lại khóa đầu", async () => {
    const { fetchFn, calls } = fakeFetch([() => ok("{}")]);
    const keys = Array.from({ length: 46 }, (_, i) => `AIzaSy${String(i).padStart(2, "0")}${"X".repeat(33)}`);
    const chat = createGeminiChat(keys, { random: () => 0, fetchFn });
    for (let i = 0; i < 47; i++) await chat(req);
    expect(new Set(calls.slice(0, 46).map((c) => c.key)).size).toBe(46);
    expect(calls[46].key).toBe(keys[0]);
  });

  it("điểm bắt đầu ngẫu nhiên: tiến trình mới không luôn bắt đầu từ khóa đầu", async () => {
    const { fetchFn, calls } = fakeFetch([() => ok("{}")]);
    await createGeminiChat([K1, K2, K3], { random: () => 0.7, fetchFn })(req);
    expect(calls[0].key).toBe(K3); // floor(0.7 * 3) = 2
  });

  it("hạn mức tính riêng từng model: khóa bị 429 ở model này vẫn dùng được cho model khác", async () => {
    const t = 1_000_000;
    const { fetchFn, calls } = fakeFetch([() => status(429), () => ok("{}"), () => ok("{}")]);
    const chat = createGeminiChat([K1], { random: () => 0, fetchFn, now: () => t });
    await expect(chat({ ...req, model: "gemini-flash-latest" })).rejects.toThrow("Gemini 429");
    expect(await chat({ ...req, model: "gemini-flash-lite-latest" })).toBe("{}"); // không bị chặn bởi 429 của flash
    await expect(chat({ ...req, model: "gemini-flash-latest" })).rejects.toThrow(); // vẫn đang nghỉ ở model cũ
    expect(calls.map((c) => c.url.match(/models\/([^:]+):/)?.[1])).toEqual(["gemini-flash-latest", "gemini-flash-lite-latest"]);
  });

  it("khóa bị từ chối (401/403) hỏng với mọi model: không thử lại ở model khác", async () => {
    const t = 1_000_000;
    const { fetchFn, calls } = fakeFetch([() => status(403)]);
    const chat = createGeminiChat([K1], { random: () => 0, fetchFn, now: () => t });
    await expect(chat({ ...req, model: "gemini-flash-latest" })).rejects.toThrow();
    await expect(chat({ ...req, model: "gemini-flash-lite-latest" })).rejects.toThrow();
    expect(calls).toHaveLength(1);
  });

  it("không có khóa nào thì báo chưa cấu hình", async () => {
    await expect(createGeminiChat([])(req)).rejects.toThrow("GEMINI_API_KEYS");
  });
});
