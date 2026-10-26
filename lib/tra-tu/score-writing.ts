export interface WritingScore { percent: number; stars: 1 | 2 | 3; label: string }

/**
 * Điểm tập viết một chữ từ số nét sai (hanzi-writer đếm mỗi lần vẽ lệch một nét): 0 lỗi = 100%, mỗi lỗi trừ 100/(2·số nét) để viết lại đúng
 * mỗi nét một lần sai vẫn còn 50%. Số sao: 3 = không sai nét nào, 2 = sai không quá nửa số nét, còn lại 1 sao (viết xong là đã tốt).
 */
export function scoreWriting(strokeCount: number, totalMistakes: number): WritingScore {
  const strokes = Math.max(1, strokeCount);
  const mistakes = Math.max(0, totalMistakes);
  const percent = Math.max(0, Math.round(100 - mistakes * (100 / (strokes * 2))));
  if (mistakes === 0) return { percent, stars: 3, label: "Hoàn hảo, không sai nét nào" };
  if (mistakes <= Math.ceil(strokes / 2)) return { percent, stars: 2, label: "Khá tốt, còn vài nét lệch" };
  return { percent, stars: 1, label: "Đã viết xong, thử lại để đẹp hơn" };
}
