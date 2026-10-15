import { describe, expect, it, vi } from "vitest";
import { assessRequestSchema, looksLikeWav, toReferenceText } from "./assess-request-schema";
import { AssessmentError } from "./assessment-normalize";
import { AssessmentUnavailableError, assessWithAzure } from "./azure-assessment";

vi.mock("server-only", () => ({}));

const wav = new Uint8Array(100);
const ok = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }));
const good = { RecognitionStatus: "Success", NBest: [{ FluencyScore: 90, CompletenessScore: 100, Words: [{ Word: "你", AccuracyScore: 90, ErrorType: "None", Phonemes: [{ Phoneme: "ni 3", AccuracyScore: 90 }] }] }] };

describe("assessWithAzure", () => {
  it("gửi câu tham chiếu trong header và trả điểm đã chuẩn hóa", async () => {
    const fetchFn = ok(good);
    const r = await assessWithAzure(wav, "你", "key", "southeastasia", fetchFn as unknown as typeof fetch);
    expect(r.syllables[0]).toMatchObject({ han: "你", pinyin: "nǐ", score: 90 });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("southeastasia.stt.speech.microsoft.com");
    expect(url).toContain("language=zh-CN");
    const header = (init.headers as Record<string, string>)["Pronunciation-Assessment"];
    expect(JSON.parse(Buffer.from(header, "base64").toString())).toMatchObject({ ReferenceText: "你", Granularity: "Phoneme", EnableMiscue: "True" });
  });
  it("HTTP lỗi hoặc mạng lỗi → AssessmentUnavailableError; không có giọng → AssessmentError", async () => {
    await expect(assessWithAzure(wav, "你", "k", "r", ok({}, 429) as unknown as typeof fetch)).rejects.toBeInstanceOf(AssessmentUnavailableError);
    await expect(assessWithAzure(wav, "你", "k", "r", (async () => { throw new Error("net"); }) as unknown as typeof fetch)).rejects.toBeInstanceOf(AssessmentUnavailableError);
    await expect(assessWithAzure(wav, "你", "k", "r", ok({ RecognitionStatus: "NoMatch" }) as unknown as typeof fetch)).rejects.toBeInstanceOf(AssessmentError);
  });
});

describe("assessRequestSchema", () => {
  const audio = "A".repeat(200);
  it("chỉ giữ chữ Hán làm câu tham chiếu", () => {
    expect(toReferenceText("你好, hello! 世界。")).toBe("你好世界");
    expect(assessRequestSchema.parse({ text: "你好，世界", audio }).text).toBe("你好世界");
  });
  it("từ chối câu không có chữ Hán, quá dài hoặc audio không phải base64", () => {
    expect(assessRequestSchema.safeParse({ text: "hello", audio }).success).toBe(false);
    expect(assessRequestSchema.safeParse({ text: "你".repeat(41), audio }).success).toBe(false);
    expect(assessRequestSchema.safeParse({ text: "你", audio: "###".repeat(50) }).success).toBe(false);
  });
  it("nhận ra tệp WAV", () => {
    const b = new Uint8Array(60); b.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0); b.set([..."WAVE"].map((c) => c.charCodeAt(0)), 8);
    expect(looksLikeWav(b)).toBe(true);
    expect(looksLikeWav(new Uint8Array(60))).toBe(false);
  });
});
