/** Độ dài tối đa của một đoạn gửi lên /api/tts (khớp `normalizeTtsText` ở server). */
export const MAX_TTS_CHARS = 40;

/** Chia nhỏ theo dấu phẩy/hai chấm khi một câu vẫn dài hơn giới hạn; cuối cùng cắt cứng. */
function splitLongPiece(piece: string, max: number): string[] {
  const clauses = piece.match(/[^，,、：:]+[，,、：:]?/g) ?? [piece];
  const out: string[] = [];
  let cur = "";
  for (const c of clauses) {
    if ((cur + c).length <= max) { cur += c; continue; }
    if (cur) out.push(cur);
    cur = c;
  }
  if (cur) out.push(cur);
  return out.flatMap((p) => (p.length <= max ? [p] : Array.from({ length: Math.ceil(p.length / max) }, (_, i) => p.slice(i * max, (i + 1) * max))));
}

/**
 * Chia văn bản tiếng Trung dài thành các đoạn ngắn (≤ `max` ký tự) theo câu để mỗi đoạn có file giọng riêng (server chỉ nhận đoạn ngắn).
 * Văn bản đã ngắn thì trả nguyên. Ghép các câu liền nhau cho đến khi sắp vượt giới hạn.
 */
export function splitForTts(text: string, max: number = MAX_TTS_CHARS): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t ? [t] : [];
  const sentences = t.match(/[^。！？!?；;]+[。！？!?；;]?/g) ?? [t];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length <= max) { cur += s; continue; }
    if (cur) out.push(cur);
    cur = s;
  }
  if (cur) out.push(cur);
  return out.flatMap((p) => (p.length <= max ? [p] : splitLongPiece(p, max)));
}
