import { normalizeTtsText } from "@/lib/tts/tts-text";
import { SCENES } from "./scenes";
import { CASES } from "./story/cases";

/**
 * Mọi câu/từ tiếng Trung của Khám phá cần giọng đọc: từ vựng và câu ví dụ của cảnh, câu hay dùng, hội thoại mẫu, lời thoại/lựa chọn/manh mối của các vụ án.
 * Dùng để tổng hợp sẵn giọng (script `prewarm-explore-tts`) nên người học bấm loa là nghe giọng tự nhiên ngay, không phải chờ Azure hay rơi về giọng máy.
 * Trả danh sách đã chuẩn hóa (giản thể, ≤ 40 ký tự) và bỏ trùng.
 */
export function collectExploreTtsTexts(): string[] {
  const raw: string[] = [];
  for (const s of Object.values(SCENES)) {
    for (const o of s.objects) raw.push(o.term, o.example.zh);
    for (const p of s.phrases ?? []) raw.push(p.zh);
    for (const l of s.conversation?.lines ?? []) raw.push(l.zh);
  }
  for (const c of Object.values(CASES)) {
    for (const clue of c.clues) raw.push(clue.zh);
    for (const sc of Object.values(c.scenes)) {
      for (const n of Object.values(sc.dialogues)) {
        raw.push(n.zh);
        for (const ch of n.choices ?? []) raw.push(ch.zh);
      }
    }
  }
  return [...new Set(raw.map(normalizeTtsText).filter((t): t is string => t !== null))];
}
