import { ALL_DIALOGUES } from "@/lib/dialogues/dialogue-catalog";
import { allComposedMessages } from "./coop/coop-messages";
import { COOP_PHRASES } from "./coop/coop-state";
import { splitForTts } from "@/lib/speech/split-for-tts";
import { normalizeTtsText } from "@/lib/tts/tts-text";
import { commandText } from "./quest-commands";
import { SCENE_STORIES } from "./scene-stories/stories";
import { SCENES } from "./scenes";
import { CASES } from "./story/cases";

/**
 * Mọi câu/từ tiếng Trung của Khám phá cần giọng đọc: từ vựng và câu ví dụ của cảnh, câu hay dùng, hội thoại mẫu, lời thoại/lựa chọn/manh mối của các vụ án, và mọi câu của kho hội thoại.
 * Dùng để tổng hợp sẵn giọng (script `prewarm-explore-tts`) nên người học bấm loa là nghe giọng tự nhiên ngay, không phải chờ Azure hay rơi về giọng máy.
 * Câu dài được chia thành các đoạn ≤ 40 ký tự như cách nút loa đọc. Trả danh sách đã chuẩn hóa (giản thể) và bỏ trùng.
 */
export function collectExploreTtsTexts(): string[] {
  const raw: string[] = [];
  for (const s of Object.values(SCENES)) {
    // Cả lệnh của NPC trong nhiệm vụ nghe lệnh ("请把…拿给我。") cho từng vật.
    for (const o of s.objects) raw.push(o.term, o.example.zh, commandText(o.term, !!o.portable));
    for (const p of s.phrases ?? []) raw.push(p.zh);
    for (const l of s.conversation?.lines ?? []) raw.push(l.zh);
  }
  for (const d of ALL_DIALOGUES) for (const l of d.lines) raw.push(l.zh);
  // Chế độ phá án cùng bạn: câu nói nhanh và mọi câu ghép từ mẫu (người nhận bấm loa nghe).
  for (const p of COOP_PHRASES) raw.push(p.zh);
  for (const m of allComposedMessages()) raw.push(m.zh);
  for (const st of Object.values(SCENE_STORIES)) raw.push(st.title.zh, ...st.lines.map((l) => l.zh), st.question.right, ...st.question.wrong);
  for (const c of Object.values(CASES)) {
    for (const clue of c.clues) raw.push(clue.zh);
    for (const sc of Object.values(c.scenes)) {
      for (const n of Object.values(sc.dialogues)) {
        raw.push(n.zh);
        for (const ch of n.choices ?? []) raw.push(ch.zh);
      }
    }
  }
  return [...new Set(raw.flatMap((t) => splitForTts(t)).map(normalizeTtsText).filter((t): t is string => t !== null))];
}
