// Độ khó của một video luyện nghe, quy ra thang "HSK ~x" (1–7) để hiện trên thẻ và lọc. Hai thành phần:
//  - Từ vựng: tỉ lệ lượt từ thuộc HSK 1–3 (từ ngoài HSK như tên riêng, từ lóng, từ hiếm tính là KHÓ). Cách cũ tính trung bình cấp HSK của mọi lượt từ nên
//    mọi video đều ra ~1,5–2,5 (vài từ HSK 1 như 我, 的, 是 lặp mãi kéo trung bình xuống, từ ngoài HSK lại bị bỏ qua), không phân biệt được video dễ và khó.
//  - Tốc độ nói: số chữ Hán mỗi giây nói; nói nhanh khó nghe hơn nên cộng thêm, nói chậm thì bớt.

/** Tỉ lệ lượt từ HSK 1–3 mà video được coi là dễ nhất (cấp 1). Đo trên 42 video thật: dễ nhất ~0,82, khó nhất ~0,49. */
const EASIEST_COVERAGE = 0.88;
/** Mỗi 8 điểm phần trăm tỉ lệ HSK 1–3 giảm đi thì cấp tăng thêm 1. */
const POINTS_PER_LEVEL = 8;
/** Tốc độ trung bình (chữ Hán/giây) coi là "bình thường"; mỗi chữ/giây chênh lệch cộng hoặc trừ ADJUST_PER_CPS cấp, tối đa ±MAX_RATE_ADJUST. */
const NORMAL_CHARS_PER_SECOND = 3.2;
const ADJUST_PER_CPS = 0.35;
const MAX_RATE_ADJUST = 0.6;
/** Ít hơn số lượt từ này thì chưa đủ căn cứ để đánh giá. */
const MIN_TOKENS = 20;
/** Mỗi dòng chỉ tính tối đa chừng này giây nói (khoảng lặng dài không làm tốc độ tụt oan). */
const MAX_LINE_SECONDS = 10;
const MIN_LINE_SECONDS = 0.5;

export const clampLineSeconds = (sec: number) => Math.min(MAX_LINE_SECONDS, Math.max(MIN_LINE_SECONDS, sec));

/**
 * @param tokenLevels cấp HSK (1–7) của từng lượt từ chữ Hán, `null` nếu ngoài danh sách HSK
 * @param hanChars tổng số chữ Hán trong lời
 * @param speakingSeconds tổng thời gian các dòng (đã qua `clampLineSeconds`)
 * @returns cấp ước lượng (một chữ số thập phân, 1–7) hoặc null nếu chưa đủ dữ liệu
 */
export function estimateLessonLevel(input: { tokenLevels: (number | null)[]; hanChars: number; speakingSeconds: number }): number | null {
  const { tokenLevels, hanChars, speakingSeconds } = input;
  if (tokenLevels.length < MIN_TOKENS) return null;
  const easy = tokenLevels.filter((l) => l !== null && l <= 3).length / tokenLevels.length;
  const vocabLevel = 1 + ((EASIEST_COVERAGE - easy) * 100) / POINTS_PER_LEVEL;
  const rate = speakingSeconds > 0 ? hanChars / speakingSeconds : NORMAL_CHARS_PER_SECOND;
  const rateAdjust = Math.max(-MAX_RATE_ADJUST, Math.min(MAX_RATE_ADJUST, (rate - NORMAL_CHARS_PER_SECOND) * ADJUST_PER_CPS));
  return Math.round(Math.max(1, Math.min(7, vocabLevel + rateAdjust)) * 10) / 10;
}
