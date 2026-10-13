import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const calls: string[] = [];
let lock: "acquired" | "busy" | "not_found" = "acquired";
let allowed = true;
let translateResult: unknown = { translated: 5, remaining: 3, filled: [{ idx: 1, translation: "x" }] };
let translateThrows = false;

vi.mock("./translate-lock", () => ({
  acquireTranslateLock: async () => { calls.push("lock"); return lock; },
  releaseTranslateLock: async () => { calls.push("release"); },
}));
vi.mock("@/lib/rate-limit/consume-usage", () => ({
  consumeUsage: async (_u: unknown, kind: string) => { calls.push(`consume:${kind}`); return allowed; },
  refundUsage: async (_u: unknown, kind: string) => { calls.push(`refund:${kind}`); },
}));
vi.mock("./admin-translate-missing", () => ({
  translateMissingLessonLines: async () => { calls.push("translate"); if (translateThrows) throw new Error("boom"); return translateResult; },
}));

const { translateMissingForUser } = await import("./translate-missing-for-user");
const user = { id: "u1", isAnonymous: true, email: null };

beforeEach(() => { calls.length = 0; lock = "acquired"; allowed = true; translateThrows = false; translateResult = { translated: 5, remaining: 3, filled: [{ idx: 1, translation: "x" }] }; });

describe("translateMissingForUser", () => {
  it("thành công: giành khóa, trừ một lượt, dịch, nhả khóa, trả tiến độ kèm các câu vừa dịch", async () => {
    const out = await translateMissingForUser(user, "aaaaaaaaaaa");
    expect(out).toEqual({ kind: "progress", translated: 5, remaining: 3, filled: [{ idx: 1, translation: "x" }] });
    expect(calls).toEqual(["lock", "consume:translate", "translate", "release"]);
  });
  it("người khác đang dịch video này: trả busy, không trừ hạn mức, không nhả khóa của người khác", async () => {
    lock = "busy";
    expect(await translateMissingForUser(user, "aaaaaaaaaaa")).toEqual({ kind: "busy" });
    expect(calls).toEqual(["lock"]);
  });
  it("video không có hoặc đã ẩn: not_found, không trừ hạn mức", async () => {
    lock = "not_found";
    expect(await translateMissingForUser(user, "aaaaaaaaaaa")).toEqual({ kind: "not_found" });
    expect(calls).toEqual(["lock"]);
  });
  it("hết hạn mức: user_limit, không dịch và vẫn nhả khóa", async () => {
    allowed = false;
    expect(await translateMissingForUser(user, "aaaaaaaaaaa")).toEqual({ kind: "user_limit" });
    expect(calls).toEqual(["lock", "consume:translate", "release"]);
  });
  it("không dịch được câu nào dù còn câu trống (AI quá tải): hoàn lượt hạn mức và báo ai_unavailable", async () => {
    translateResult = { translated: 0, remaining: 40, filled: [] };
    expect(await translateMissingForUser(user, "aaaaaaaaaaa")).toEqual({ kind: "ai_unavailable", remaining: 40 });
    expect(calls).toEqual(["lock", "consume:translate", "translate", "refund:translate", "release"]);
  });
  it("lỗi bất ngờ khi dịch: hoàn lượt, nhả khóa rồi ném lỗi", async () => {
    translateThrows = true;
    await expect(translateMissingForUser(user, "aaaaaaaaaaa")).rejects.toThrow("boom");
    expect(calls).toEqual(["lock", "consume:translate", "translate", "refund:translate", "release"]);
  });
  it("video đã dịch hết (0 dòng cần dịch): coi là tiến độ 0, không hoàn lượt (không có lỗi)", async () => {
    translateResult = { translated: 0, remaining: 0, filled: [] };
    expect(await translateMissingForUser(user, "aaaaaaaaaaa")).toMatchObject({ kind: "progress", remaining: 0 });
    expect(calls).not.toContain("refund:translate");
  });
});
