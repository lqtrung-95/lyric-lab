import { shuffle, type Rng } from "./random";

export interface MatchCard {
  item_key: string;
  term: string;
  pinyin: string | null;
  meaning: string;
}

export interface MatchRound {
  lefts: { id: string; text: string; sub: string | null }[];
  rights: { id: string; text: string }[];
}

const MAX_MEANING = 38;

/** Nghĩa ngắn gọn để hiện trên ô ghép: lấy phần đầu (trước dấu ; hoặc ,) và cắt cho vừa ô. */
export function shortMeaning(meaning: string): string {
  const first = meaning.split(/[;,；，]/)[0].trim() || meaning.trim();
  return first.length > MAX_MEANING ? `${first.slice(0, MAX_MEANING - 1)}…` : first;
}

/**
 * Dựng một vòng ghép cặp: tối đa `size` thẻ, chữ Hán một cột và nghĩa một cột (đã xáo). Bỏ thẻ mà chữ Hán hoặc nghĩa ngắn
 * trùng với thẻ khác trong vòng, vì khi đó có hai đáp án ghép đúng.
 */
export function buildMatchRound(cards: MatchCard[], size: number, rng?: Rng): MatchRound {
  const seenTerm = new Set<string>();
  const seenMeaning = new Set<string>();
  const chosen: { card: MatchCard; meaning: string }[] = [];
  for (const card of shuffle(cards, rng)) {
    const meaning = shortMeaning(card.meaning);
    const key = meaning.toLowerCase();
    if (!meaning || seenTerm.has(card.term) || seenMeaning.has(key)) continue;
    seenTerm.add(card.term);
    seenMeaning.add(key);
    chosen.push({ card, meaning });
    if (chosen.length === size) break;
  }
  return {
    lefts: chosen.map(({ card }) => ({ id: card.item_key, text: card.term, sub: card.pinyin })),
    rights: shuffle(chosen.map(({ card, meaning }) => ({ id: card.item_key, text: meaning })), rng),
  };
}
