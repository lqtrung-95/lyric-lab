import { describe, expect, it } from "vitest";
import { pickSentencesFromCards } from "./card-sentences";

const card = (term: string, kind: "vocab" | "grammar" = "vocab") => ({ kind, term, pinyin: "x", meaning: "nghĩa" });

describe("pickSentencesFromCards", () => {
  it("bỏ ngữ pháp, thẻ không có chữ Hán, thẻ quá dài và thẻ trùng", () => {
    const out = pickSentencesFromCards([card("离开"), card("离开"), card("A + B", "vocab"), card("是…的", "grammar"), card("好".repeat(41)), card("喜欢")], 10, () => 0.5);
    expect(out.map((s) => s.han).sort()).toEqual(["喜欢", "离开"].sort());
  });
  it("giới hạn số lượng", () => {
    expect(pickSentencesFromCards(["一", "二", "三", "四"].map((t) => card(t)), 2)).toHaveLength(2);
  });
});
