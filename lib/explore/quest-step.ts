// Luật một lần tương tác trong nhiệm vụ (hàm thuần, dễ test). Có hai loại câu: "đi tới" (chạm đúng vật là xong) và "mang đồ" (nhặt đúng vật rồi mang tới NPC).

export type TapOutcome =
  | { type: "ignore" }
  | { type: "pickup"; id: string }
  | { type: "correct" }
  | { type: "wrong" };

export interface TapInput {
  targetId: string;
  /** Câu này phải nhặt vật rồi giao cho NPC. */
  needsDelivery: boolean;
  tappedId: string;
  /** Vật nhân vật đang cầm (null nếu tay không). */
  carrying: string | null;
  npcId: string;
}

/**
 * Kết quả của một lần tương tác:
 * - đang cầm vật: chỉ giao cho NPC mới xong câu (đúng); tương tác với thứ khác bỏ qua (vẫn đang cầm);
 * - tay không: NPC chưa có gì để nhận (bỏ qua); chọn vật sai là sai; chọn đúng thì xong ngay (câu "đi tới") hoặc nhặt lên (câu "mang đồ").
 */
export function resolveTap({ targetId, needsDelivery, tappedId, carrying, npcId }: TapInput): TapOutcome {
  if (carrying) return tappedId === npcId ? { type: "correct" } : { type: "ignore" };
  if (tappedId === npcId) return { type: "ignore" };
  if (tappedId !== targetId) return { type: "wrong" };
  return needsDelivery ? { type: "pickup", id: tappedId } : { type: "correct" };
}
