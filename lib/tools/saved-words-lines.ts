import type { CardRow } from "@/lib/user-data/learner-sync";

const MAX_MEANING = 40;
const HAN_WORD = /^\p{Script=Han}{1,4}$/u;

/** Nghĩa ngắn gọn của thẻ: phần đầu trước dấu phân cách nghĩa, bỏ khoảng trắng thừa; dài quá hoặc rỗng thì không có (null) để tờ bài tập không bị tràn. */
export function shortMeaning(meaning: string): string | null {
  const first = meaning.split(/[;；/、]|,\s|，/)[0].replace(/\s+/g, " ").trim();
  return first && first.length <= MAX_MEANING ? first : null;
}

/**
 * Các dòng cho tờ bài tập từ thẻ đã lưu của tài khoản: chọn ngẫu nhiên `count` từ vựng khác nhau (chỉ chữ Hán, 1 đến 4 chữ; bỏ thẻ ngữ pháp và cụm dài), mỗi dòng "chữ Hán, nghĩa".
 * Thẻ không có nghĩa ngắn gọn thì chỉ có chữ Hán (bài nối với nghĩa khi đó sẽ tự tắt).
 */
export function savedCardsToLines(cards: readonly Pick<CardRow, "kind" | "term" | "meaning">[], count: number, rng: () => number = Math.random): string[] {
  const seen = new Set<string>();
  const pool = cards.filter((c) => c.kind === "vocab" && HAN_WORD.test(c.term) && !seen.has(c.term) && seen.add(c.term));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((c) => { const m = shortMeaning(c.meaning); return m ? `${c.term}, ${m}` : c.term; });
}
