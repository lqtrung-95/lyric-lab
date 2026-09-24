import { afterEach, describe, expect, it, vi } from "vitest";
import { CaptionError } from "./caption-errors";
import { YoutubeInnertubeCaptionProvider } from "./youtube-innertube-caption-provider";

const provider = new YoutubeInnertubeCaptionProvider();
const ID = "dQw4w9WgXcQ";
const track = (ref?: string) => ({ lang: "zh", kind: "manual" as const, ref });

afterEach(() => vi.unstubAllGlobals());

describe("YoutubeInnertubeCaptionProvider (không gọi mạng thật)", () => {
  it("từ chối videoId sai trước khi gọi bất kỳ request nào", async () => {
    await expect(provider.listTracks("../etc/passwd")).rejects.toBeInstanceOf(CaptionError);
    await expect(provider.fetchLines("bad", track("https://www.youtube.com/api/timedtext"))).rejects.toBeInstanceOf(CaptionError);
  });

  it("từ chối URL track không thuộc youtube.com", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(provider.fetchLines(ID, track("https://evil.example.com/timedtext"))).rejects.toMatchObject({ type: "parse" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("HTTP 429 → blocked; body rỗng → blocked", async () => {
    const ref = "https://www.youtube.com/api/timedtext?v=x";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("", { status: 429 })));
    await expect(provider.fetchLines(ID, track(ref))).rejects.toMatchObject({ type: "blocked" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("", { status: 200 })));
    await expect(provider.fetchLines(ID, track(ref))).rejects.toMatchObject({ type: "blocked" });
  });

  it("gọi với fmt=json3, bỏ tlang, và parse events", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ events: [{ tStartMs: 1000, dDurationMs: 2000, segs: [{ utf8: "你的笑" }] }] })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const lines = await provider.fetchLines(ID, track("https://www.youtube.com/api/timedtext?v=x&tlang=vi"));
    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.searchParams.get("fmt")).toBe("json3");
    expect(url.searchParams.has("tlang")).toBe(false);
    expect(lines).toEqual([{ text: "你的笑", start: 1, end: 3 }]);
  });
});
