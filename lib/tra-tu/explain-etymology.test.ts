import { describe, expect, it, vi } from "vitest";
import { buildEtymologyPrompt, allowedHan } from "./etymology-note";
import { explainEtymology, type ExplainEtymologyDeps } from "./explain-etymology";
import type { HanziInfoView } from "./hanzi-info-types";

const info: HanziInfoView = {
  hanzi: "明", sinoViet: ["minh"], radical: { char: "日", sinoViet: "nhật" }, layout: "⿰", layoutLabel: "trái – phải",
  components: [{ char: "日", sinoViet: "nhật" }, { char: "月", sinoViet: "nguyệt" }],
  etymology: { type: "ideographic", hint: "sun and moon" }, definition: "bright",
};
const GOOD = JSON.stringify({ story: "Ghép 日 (mặt trời) và 月 (mặt trăng) thành ánh sáng.", mnemonic: "nhật + nguyệt = minh" });
const deps = (over: Partial<ExplainEtymologyDeps> = {}): ExplainEtymologyDeps => ({ readCache: async () => null, writeCache: async () => {}, chat: async () => GOOD, models: ["a", "b"], ...over });

describe("explainEtymology", () => {
  it("trả lời đúng dạng và ghi đệm", async () => {
    const write = vi.fn();
    const r = await explainEtymology(info, deps({ writeCache: write }));
    expect(r.stored.note.story).toContain("日");
    expect(write).toHaveBeenCalledOnce();
  });
  it("loại model nhắc tới chữ Hán ngoài dữ kiện, rớt sang model kế", async () => {
    const bad = JSON.stringify({ story: "Có 火 (lửa) trong chữ." });
    const chat = vi.fn().mockResolvedValueOnce(bad).mockResolvedValueOnce(GOOD);
    expect((await explainEtymology(info, deps({ chat }))).stored.model).toBe("b");
  });
  it("có bản lưu thì không gọi model", async () => {
    const chat = vi.fn();
    const r = await explainEtymology(info, deps({ chat, readCache: async () => ({ note: { story: "x" }, model: "m" }) }));
    expect(r.fromCache).toBe(true);
    expect(chat).not.toHaveBeenCalled();
  });
});

describe("buildEtymologyPrompt", () => {
  it("đưa Hán Việt, thành phần và loại chữ vào dữ kiện; chữ cho phép gồm thành phần", () => {
    const p = buildEtymologyPrompt(info);
    expect(p).toContain("Hán Việt: minh");
    expect(p).toContain("Thành phần: 日 (Hán Việt: nhật), 月 (Hán Việt: nguyệt)");
    expect(p).toContain("Loại chữ: Hội ý");
    expect([...allowedHan(info)].sort()).toEqual(["日", "明", "月"].sort());
  });
});
