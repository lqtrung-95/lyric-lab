import { describe, expect, it } from "vitest";
import { fetchExplanation, fetchTermEntry } from "./lookup-client";

const json = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("lookup client", () => {
  it("fetchTermEntry: có mục, không có mục, 429, lỗi mạng", async () => {
    expect(await fetchTermEntry("城市", undefined, json({ entry: { term: "城市" } }))).toEqual({ ok: true, value: { term: "城市" } });
    expect(await fetchTermEntry("城市", undefined, json({ entry: null }))).toEqual({ ok: true, value: null });
    expect(await fetchTermEntry("城市", undefined, json({}, 429))).toEqual({ ok: false, reason: "rate_limited" });
    expect(await fetchTermEntry("城市", undefined, (async () => { throw new Error("mạng"); }) as unknown as typeof fetch)).toEqual({ ok: false, reason: "error" });
  });

  it("fetchExplanation: ánh xạ mã HTTP", async () => {
    const req = { videoId: "dQw4w9WgXcQ", lineIndex: 0, term: "慢慢" };
    expect((await fetchExplanation(req, undefined, json({ meaningInContext: "dần dần", model: "m", fromCache: false }))).ok).toBe(true);
    expect(await fetchExplanation(req, undefined, json({}, 429))).toEqual({ ok: false, reason: "rate_limited" });
    expect(await fetchExplanation(req, undefined, json({}, 400))).toEqual({ ok: false, reason: "not_available" });
    expect(await fetchExplanation(req, undefined, json({}, 502))).toEqual({ ok: false, reason: "error" });
  });
});
