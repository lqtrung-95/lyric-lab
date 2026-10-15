import type { ToneGuess } from "./pitch";
import type { ToneId } from "./tone-data";

export type ToneVerdict = "match" | "close" | "miss" | "unclear";
export interface ToneFeedback { verdict: ToneVerdict; message: string }

/** Lời khuyên khi thanh nhận ra khác thanh mục tiêu: nói rõ giọng người học đang đi theo hướng nào và cần sửa thế nào. */
const ADVICE: Record<ToneId, Partial<Record<ToneId, string>>> = {
  1: {
    2: "Giọng bạn đang đi lên. Thanh 1 phải giữ CAO và BẰNG từ đầu đến cuối, không lên cũng không xuống.",
    3: "Giọng bạn xuống rồi lên (như thanh 3). Thanh 1 chỉ giữ cao và bằng.",
    4: "Giọng bạn đang tụt xuống. Thanh 1 phải giữ nguyên độ cao, đừng để giọng rơi ở cuối.",
  },
  2: {
    1: "Giọng chưa lên đủ. Thanh 2 phải đi lên rõ rệt từ giữa lên cao, như khi hỏi lại 'hả?'.",
    3: "Bạn đang xuống trước rồi mới lên (thanh 3). Thanh 2 chỉ đi lên, không có đoạn xuống.",
    4: "Giọng bạn đang đi xuống. Thanh 2 phải đi LÊN.",
  },
  3: {
    1: "Giọng còn bằng. Thanh 3 cần xuống thấp rồi mới lên lại; kéo dài âm tiết một chút.",
    2: "Bạn chỉ đi lên mà chưa xuống trước. Thanh 3: xuống thấp rồi mới lên.",
    4: "Bạn mới xuống mà chưa lên lại. Thanh 3 xuống thấp rồi NHỚ lên ở cuối.",
  },
  4: {
    1: "Giọng chưa xuống. Thanh 4 phải rơi dứt khoát từ cao xuống thấp.",
    2: "Giọng bạn đang đi lên. Thanh 4 phải xuống mạnh, như ra lệnh.",
    3: "Bạn xuống rồi lại lên. Thanh 4 chỉ xuống một mạch, không lên lại ở cuối.",
  },
};

/** Nhận xét một lần đọc một âm tiết: thanh nhận ra so với thanh cần đọc. Không kết luận được (giọng quá nhỏ/ngắn) thì báo để đọc lại thay vì chấm sai. */
export function toneFeedback(target: ToneId, guess: ToneGuess): ToneFeedback {
  if (guess.tone === null) return { verdict: "unclear", message: "Chưa nghe rõ cao độ giọng bạn. Hãy đọc to và rõ hơn, nói chậm một chút rồi thử lại." };
  if (guess.tone === target) {
    return guess.confidence >= 0.35
      ? { verdict: "match", message: `Tốt! Đường cao độ của bạn khớp thanh ${target}.` }
      : { verdict: "close", message: `Gần đúng thanh ${target}, nhưng đường cao độ chưa rõ nét. Đọc dứt khoát hơn và nhấn rõ hướng lên/xuống.` };
  }
  return { verdict: "miss", message: ADVICE[target][guess.tone] ?? `Giọng bạn nghe giống thanh ${guess.tone} hơn thanh ${target}.` };
}
