import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import type { RoundCard, RoundSummary } from "./room-types";

/** Thẻ ôn từ một câu của ván (từ vựng đúng của câu, kèm dòng lời để nghe lại đúng đoạn). */
export function roundCardToSavedItem(card: RoundCard, savedAt: number): SavedItem {
  return {
    key: itemKey({ type: "vocab", term: card.term }), videoId: card.videoId, type: "vocab", term: card.term,
    lineIndex: card.lineIndex, start: card.start, savedAt,
    reading: card.reading ?? undefined, sinoViet: card.sinoViet ?? undefined, meaning: card.meaning,
  };
}

/** Các câu người xem trả lời sai hoặc bỏ trống (từ cần ôn), không trùng từ. */
export function missedRoundCards(rounds: RoundSummary[]): RoundCard[] {
  const seen = new Set<string>();
  const out: RoundCard[] = [];
  for (const r of rounds) {
    if (r.mine?.correct || !r.card || seen.has(r.card.term)) continue;
    seen.add(r.card.term);
    out.push(r.card);
  }
  return out;
}
