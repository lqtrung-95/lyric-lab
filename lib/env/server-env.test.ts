import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("getServerEnv", () => {
  it("báo lỗi khi thiếu key bắt buộc", async () => {
    const { getServerEnv } = await import("./server-env");
    vi.stubEnv("YOUTUBE_DATA_API_KEY", "");
    expect(() => getServerEnv()).toThrow();
    vi.unstubAllEnvs();
  });

  it("key optional để trống (chuỗi rỗng, .env chưa điền) không làm lỗi các key khác", async () => {
    const { getServerEnv } = await import("./server-env");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "srk");
    vi.stubEnv("GROQ_API_KEY", "groq");
    vi.stubEnv("YOUTUBE_DATA_API_KEY", "yt");
    vi.stubEnv("CAPTION_PROBE_SECRET", ""); // min(16) nếu có, nhưng để trống thì phải được coi là chưa đặt
    vi.stubEnv("AZURE_SPEECH_KEY", "");
    const env = getServerEnv();
    expect(env.CAPTION_PROBE_SECRET).toBeUndefined();
    expect(env.AZURE_SPEECH_KEY).toBeUndefined();
    vi.unstubAllEnvs();
  });
});
