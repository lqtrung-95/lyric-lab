import { describe, expect, it } from "vitest";
import { buildEnrichPrompt, parseEnrichment } from "./word-enrichment";

describe("parseEnrichment", () => {
  const terms = ["苹果", "离开", "但是", "地铁"];
  it("giữ emoji đơn hợp lệ và mẹo vừa độ dài, bỏ rác", () => {
    const raw = '```json\n{"items":{"苹果":{"emoji":"🍎","tip":""},"离开":{"emoji":"","tip":"Hán Việt là ly khai: rời đi, tách ra"},"但是":{"emoji":"abc","tip":"x"},"地铁":{"emoji":"🍎🍎","tip":""}}}\n```';
    const out = parseEnrichment(raw, terms, { 离开: "ly khai", 苹果: null });
    expect(out.emojis).toEqual({ 苹果: "🍎" });
    expect(out.tips).toEqual({ 离开: "Hán Việt là ly khai: rời đi, tách ra" });
    expect(out.answered).toEqual(terms);
  });
  it("mẹo không nhắc đúng âm Hán Việt của từ (hoặc từ không có Hán Việt) thì bị loại", () => {
    const raw = '{"items":{"午餐":{"emoji":"","tip":"ngọ xun: bữa trưa nhé nhé"},"离开":{"emoji":"","tip":"Rời đi, tách ra khỏi nơi nào đó"},"请客":{"emoji":"","tip":"thỉnh khách là mời khách đó"}}}';
    expect(parseEnrichment(raw, ["午餐", "离开", "请客"], { 午餐: "ngọ xan", 离开: "ly khai", 请客: null }).tips).toEqual({});
    expect(parseEnrichment(raw, ["午餐"], { 午餐: "ngọ xun" }).tips).toEqual({ 午餐: "ngọ xun: bữa trưa nhé nhé" });
  });
  it("chấp nhận emoji có biến thể (cờ vị trí, tông da, ghép) và JSON hỏng thì coi như chưa trả lời", () => {
    expect(parseEnrichment('{"items":{"手":{"emoji":"👍🏽","tip":""},"家":{"emoji":"🏠","tip":""}}}', ["手", "家"]).emojis).toEqual({ 手: "👍🏽", 家: "🏠" });
    expect(parseEnrichment("không phải json", ["a"]).answered).toEqual([]);
  });
  it("từ model không nhắc tới không nằm trong answered", () => {
    expect(parseEnrichment('{"items":{"苹果":{"emoji":"🍎"}}}', ["苹果", "香蕉"]).answered).toEqual(["苹果"]);
  });
});

describe("buildEnrichPrompt", () => {
  it("liệt kê từ kèm pinyin, Hán Việt và nghĩa", () => {
    expect(buildEnrichPrompt([{ term: "离开", pinyin: "líkāi", sinoViet: "ly khai", gloss: "rời đi" }])).toContain("离开 | líkāi | Hán Việt: ly khai | rời đi");
  });
});
