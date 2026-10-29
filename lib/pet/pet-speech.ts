import type { PetMood } from "./pet-logic";

/** Câu pet nói khi được chạm, theo tâm trạng. Giọng nhẹ, khích lệ; không dùng chữ nặng nề (chết, đói khổ, bỏ rơi). */
const TAP_LINES: Record<PetMood, readonly ((name: string) => string)[]> = {
  happy: [
    (n) => `${n} no rồi, cảm ơn bạn nhé!`,
    () => "Hôm nay bạn giỏi quá!",
    () => "Mình vui lắm, mai học tiếp nha.",
    () => "Cùng học thêm một từ nữa không?",
  ],
  hungry: [
    (n) => `${n} muốn ăn chữ! Học một chút nha.`,
    () => "Một thẻ thôi cũng làm mình no nè.",
    () => "Mình đang chờ bạn đó.",
    () => "Ôn vài từ là mình vui ngay.",
  ],
  sleepy: [
    () => "Zzz... bạn về rồi hả?",
    (n) => `${n} dậy liền đây, không sao đâu.`,
    () => "Học lại một chút là mình tỉnh ngủ.",
  ],
};

/** Một câu cho tâm trạng này; `seed` (số lần chạm) quay vòng qua các câu để không lặp liên tiếp. */
export function pickPetLine(mood: PetMood, name: string, seed: number): string {
  const lines = TAP_LINES[mood];
  return lines[Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) % lines.length : 0](name);
}

/** Số lần pet được nói mỗi ngày (chạm thêm vẫn nảy và kêu, chỉ không hiện câu mới). */
export const PET_SPEECH_PER_DAY = 6;

export interface PetSpeechBudget { day: string; count: number }

/** Còn lượt nói hôm nay không; sang ngày mới thì tính lại từ 0. Trả `next` để lưu nếu `allowed`. */
export function spendSpeech(budget: PetSpeechBudget | null, today: string): { allowed: boolean; next: PetSpeechBudget } {
  const count = budget && budget.day === today ? budget.count : 0;
  return { allowed: count < PET_SPEECH_PER_DAY, next: { day: today, count: count + 1 } };
}
