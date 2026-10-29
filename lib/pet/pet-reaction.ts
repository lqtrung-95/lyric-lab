import type { PetMood } from "./pet-logic";

/** Ảnh chụp những gì pet cần để nhận ra một sự kiện: so hai ảnh liên tiếp. */
export interface PetSnapshot { level: number; streak: number; mood: PetMood }

export type PetReaction = "levelUp" | "streakUp" | "goalDone" | "streakLost";

/**
 * Sự kiện đáng phản ứng giữa hai ảnh chụp (chỉ MỘT, ưu tiên cái "to" nhất): lên cấp > tăng chuỗi > vừa đạt mục tiêu ngày > mất chuỗi.
 * Chưa có ảnh trước (lần tải đầu) thì không phản ứng, để mở trang không làm pet reo vô cớ.
 */
export function petReactionFor(prev: PetSnapshot | null, next: PetSnapshot | null): PetReaction | null {
  if (!prev || !next) return null;
  if (next.level > prev.level) return "levelUp";
  if (next.streak > prev.streak) return "streakUp";
  if (next.mood === "happy" && prev.mood !== "happy") return "goalDone";
  if (prev.streak > 0 && next.streak === 0) return "streakLost";
  return null;
}

/** Lời pet nói. Mất chuỗi chỉ buồn nhẹ và rủ học lại, không trách móc (pet không chết, không mất gì). */
export function petReactionLine(reaction: PetReaction, name: string): string {
  switch (reaction) {
    case "levelUp": return `Bạn lên cấp rồi! ${name} tự hào lắm!`;
    case "streakUp": return "Chuỗi ngày dài thêm một bậc, giỏi quá!";
    case "goalDone": return `Đạt mục tiêu hôm nay rồi! ${name} no bụng rồi nè.`;
    case "streakLost": return `Chuỗi ngày tạm nghỉ rồi. Không sao, mình bắt đầu lại cùng nhau nhé.`;
  }
}
