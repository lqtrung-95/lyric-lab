/** Mức phản ứng của pet khi chấm phát âm: điểm chung 0–100 → câu nói. Giọng khích lệ, điểm thấp cũng không chê. */
export type EchoTier = "great" | "good" | "tryAgain";

export const ECHO_GREAT = 85;
export const ECHO_GOOD = 60;

export function echoTier(overall: number): EchoTier {
  const s = Number.isFinite(overall) ? overall : 0;
  return s >= ECHO_GREAT ? "great" : s >= ECHO_GOOD ? "good" : "tryAgain";
}

export function echoLine(tier: EchoTier, name: string): string {
  switch (tier) {
    case "great": return `Chuẩn quá! ${name} nghe như người bản xứ nói luôn!`;
    case "good": return `Khá lắm! ${name} nghe rõ rồi, thử thêm lần nữa để còn tròn hơn nhé.`;
    case "tryAgain": return `${name} chưa nghe rõ lắm. Nghe lại mẫu rồi mình thử cùng nhau nhé!`;
  }
}
