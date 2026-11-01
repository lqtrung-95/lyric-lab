import { hanChars } from "@/lib/speaking/reply-match";

/** Điểm tối thiểu (0–100, điểm phát âm chung) để câu đọc to / nhại câu được tính đúng. Khoan dung vì điểm của dịch vụ chấm dao động nhẹ giữa các lần đọc. */
export const SPEAK_PASS_SCORE = 60;

/**
 * Câu "nhìn nghĩa, nói từ" đúng khi lời nhận diện chứa nguyên từ, hoặc (từ từ ba chữ trở lên) chứa ít nhất 80% số chữ của từ: nhận diện giọng hay nhầm một chữ đồng âm.
 * Từ một hai chữ phải khớp nguyên vẹn để không đoán bừa.
 */
export function judgeRecall(transcript: string, term: string): boolean {
  if (!term) return false;
  if (transcript.includes(term)) return true;
  const want = hanChars(term);
  if (want.length < 3) return false;
  const said = new Set(hanChars(transcript));
  return want.filter((c) => said.has(c)).length / want.length >= 0.8;
}

/** Số câu đã thật sự nói (không tính câu bỏ qua) và phần trăm đúng của chúng; chưa nói đủ `minAttempts` câu thì 0% (không đủ dữ liệu để tính qua cấp). */
export function speakingPercent(correct: number, total: number, skipped: number, minAttempts: number): { percent: number; attempted: number } {
  const attempted = Math.max(0, total - skipped);
  if (attempted < minAttempts) return { percent: 0, attempted };
  return { percent: Math.round((100 * correct) / attempted), attempted };
}
