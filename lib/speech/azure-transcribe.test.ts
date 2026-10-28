import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { TranscribeUnavailableError, transcribeWithAzure } = await import("./azure-transcribe");

const ok = (body: unknown, status = 200) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe("transcribeWithAzure", () => {
  it("trả chữ nhận được khi thành công", async () => {
    const f = ok({ RecognitionStatus: "Success", DisplayText: "你好。" });
    await expect(transcribeWithAzure(new Uint8Array(100), "k", "r", f as never)).resolves.toBe("你好。");
    expect(String(f.mock.calls[0][0])).toContain("language=zh-CN");
  });
  it("trả rỗng khi không nghe thấy giọng", async () => {
    await expect(transcribeWithAzure(new Uint8Array(100), "k", "r", ok({ RecognitionStatus: "NoMatch" }) as never)).resolves.toBe("");
  });
  it("ném lỗi khi Azure trả 5xx hoặc mất mạng", async () => {
    await expect(transcribeWithAzure(new Uint8Array(100), "k", "r", ok({}, 503) as never)).rejects.toBeInstanceOf(TranscribeUnavailableError);
    await expect(transcribeWithAzure(new Uint8Array(100), "k", "r", vi.fn().mockRejectedValue(new Error("x")) as never)).rejects.toBeInstanceOf(TranscribeUnavailableError);
  });
});
