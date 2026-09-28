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
// Nghĩa ngắn gọn (một cụm từ) hợp làm ô ghép; câu giải thích dài hoặc có trích dẫn từ thì không.
const CLEAN_MEANING = 30;
const isClean = (meaning: string, term: string) => meaning.length <= CLEAN_MEANING && !meaning.includes(term) && !/["“”]/.test(meaning);

// Nghĩa tra từ (bấm từ trong lời để tra) hay mở đầu bằng cụm dẫn nhập kiểu "Ở câu này, …" (để không lộ đáp án khi
// hiện làm gợi ý ở màn Nghe). Cắt theo dấu phẩy đầu tiên bên dưới mà không bỏ cụm này trước thì chỉ còn lại đúng
// cụm dẫn nhập, mất hết nội dung thật.
const LEAD_IN = /^(ở|trong)\s+(câu này|đây|ngữ cảnh này)\s*[,:]\s*/iu;

/** Nghĩa ngắn gọn để hiện trên ô ghép: bỏ cụm dẫn nhập nếu có, lấy phần đầu (trước dấu ; hoặc ,) và cắt cho vừa ô. */
export function shortMeaning(meaning: string): string {
  const withoutLeadIn = meaning.replace(LEAD_IN, "");
  const first = withoutLeadIn.split(/[;,；，]/)[0].trim() || withoutLeadIn.trim();
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
  const candidates = shuffle(cards, rng).map((card) => ({ card, meaning: shortMeaning(card.meaning) }));
  // Ưu tiên thẻ có nghĩa ngắn gọn; thiếu thì mới bù bằng thẻ có nghĩa dài (đã cắt ngắn).
  const ordered = [...candidates.filter((c) => isClean(c.meaning, c.card.term)), ...candidates.filter((c) => !isClean(c.meaning, c.card.term))];
  for (const { card, meaning } of ordered) {
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
