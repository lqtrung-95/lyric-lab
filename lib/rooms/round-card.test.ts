import { describe, expect, it } from "vitest";
import { missedRoundCards, roundCardToSavedItem } from "./round-card";
import type { RoundCard, RoundSummary } from "./room-types";

const card = (term: string): RoundCard => ({ term, reading: "yuǎn", sinoViet: null, meaning: "xa", videoId: "abcdefghijk", lineIndex: 2, start: 9.5 });
const round = (index: number, term: string, correct: boolean | null): RoundSummary => ({
  index, correctTerm: term, translation: null, card: card(term),
  mine: correct === null ? null : { choice: 0, correct, points: correct ? 100 : 0, elapsedMs: 1000 }, theirs: null,
});

describe("roundCardToSavedItem", () => {
  it("dựng thẻ vocab với khóa chung của app và giữ dòng lời để nghe lại", () => {
    expect(roundCardToSavedItem(card("远"), 5)).toEqual({
      key: "vocab:远", videoId: "abcdefghijk", type: "vocab", term: "远", lineIndex: 2, start: 9.5, savedAt: 5,
      reading: "yuǎn", sinoViet: undefined, meaning: "xa",
    });
  });
});

describe("missedRoundCards", () => {
  it("lấy câu sai và câu bỏ trống, bỏ câu đúng và từ trùng", () => {
    const rounds = [round(0, "近", true), round(1, "远", false), round(2, "高", null), round(3, "远", false)];
    expect(missedRoundCards(rounds).map((c) => c.term)).toEqual(["远", "高"]);
  });
  it("bỏ qua câu không có thẻ", () => {
    expect(missedRoundCards([{ ...round(0, "远", false), card: null }])).toEqual([]);
  });
});
