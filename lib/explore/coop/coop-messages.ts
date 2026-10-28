import { COOP_ITEMS } from "./coop-items";
import { COOP_PLACES } from "./coop-places";

/**
 * Câu nói có chỗ trống của chế độ chơi chung: người chơi chọn mẫu câu và điền nơi chốn (một cảnh của vụ án) hoặc đồ vật để nói chuyện bằng tiếng Trung với đồng đội.
 * Không có chữ gõ tự do nên không cần kiểm duyệt: tin nhận được chỉ hợp lệ khi khớp đúng một mẫu và một giá trị trong danh sách.
 * `{s}` là chỗ điền; `slot` cho biết điền nơi chốn ("p"), đồ vật ("o") hay không có chỗ trống (null).
 */
export type SlotKind = "p" | "o" | null;
export interface MessageTemplate { id: string; zh: string; vi: string; slot: SlotKind }

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: "at", zh: "我在{s}。", vi: "Tôi đang ở {s}.", slot: "p" },
  { id: "goto", zh: "你去{s}看看。", vi: "Bạn đến {s} xem thử.", slot: "p" },
  { id: "found", zh: "我在{s}找到了线索。", vi: "Tôi tìm được manh mối ở {s}.", slot: "p" },
  { id: "went", zh: "我昨天去过{s}。", vi: "Hôm qua tôi đã đến {s}.", slot: "p" },
  { id: "who", zh: "谁去过{s}?", vi: "Ai đã từng đến {s}?", slot: "p" },
  { id: "said", zh: "他说他在{s}。", vi: "Anh ấy nói anh ấy ở {s}.", slot: "p" },
  { id: "liar", zh: "我觉得{s}的人在说谎。", vi: "Tôi nghĩ người ở {s} đang nói dối.", slot: "p" },
  { id: "foundo", zh: "我找到了{s}。", vi: "Tôi đã tìm thấy {s}.", slot: "o" },
  { id: "sawo", zh: "你看见{s}了吗?", vi: "Bạn có thấy {s} không?", slot: "o" },
  { id: "whose", zh: "{s}是谁的?", vi: "{s} là của ai?", slot: "o" },
  { id: "lying", zh: "我觉得他在说谎。", vi: "Tôi nghĩ anh ấy đang nói dối.", slot: null },
  { id: "yours", zh: "你那边有什么线索?", vi: "Bên bạn có manh mối gì?", slot: null },
  { id: "again", zh: "请再说一遍。", vi: "Xin nói lại một lần.", slot: null },
  { id: "agree", zh: "我同意。", vi: "Tôi đồng ý.", slot: null },
  { id: "disagree", zh: "我不同意。", vi: "Tôi không đồng ý.", slot: null },
  { id: "ready", zh: "我们可以指认了吗?", vi: "Chúng ta có thể buộc tội chưa?", slot: null },
];

export interface ComposedMessage { zh: string; vi: string }

/** Các giá trị điền được cho một loại chỗ trống: id (nơi chốn là id cảnh, đồ vật là chính chữ Hán) và cách hiện. */
export function slotOptions(kind: Exclude<SlotKind, null>, placeIds: readonly string[] = Object.keys(COOP_PLACES)): { id: string; zh: string; vi: string }[] {
  return kind === "p"
    ? placeIds.flatMap((id) => (COOP_PLACES[id] ? [{ id, ...COOP_PLACES[id] }] : []))
    : COOP_ITEMS.map((i) => ({ id: i.zh, ...i }));
}

/** Ghép một mẫu với giá trị điền (id nơi chốn hoặc chữ Hán đồ vật); mẫu cần chỗ trống mà thiếu hoặc sai giá trị thì null. */
export function composeMessage(templateId: string, value?: string): ComposedMessage | null {
  const t = MESSAGE_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return null;
  if (!t.slot) return { zh: t.zh, vi: t.vi };
  const opt = value ? slotOptions(t.slot).find((o) => o.id === value) : undefined;
  return opt ? { zh: t.zh.replace("{s}", opt.zh), vi: t.vi.replace("{s}", opt.vi) } : null;
}

/** Mọi câu ghép được từ các mẫu và giá trị điền (dùng để tổng hợp sẵn giọng đọc và kiểm tra tin nhận được). */
export function allComposedMessages(): ComposedMessage[] {
  return MESSAGE_TEMPLATES.flatMap((t) => (t.slot ? slotOptions(t.slot).flatMap((o) => composeMessage(t.id, o.id) ?? []) : composeMessage(t.id) ?? []));
}

const ALL = new Map<string, ComposedMessage>();
/** Tin nhận được qua kênh: chỉ chấp nhận câu khớp đúng một câu ghép hợp lệ (trả lại câu tiếng Trung và nghĩa). Chữ lạ từ người ngoài bị bỏ. */
export function parseMessage(text: unknown): ComposedMessage | null {
  if (typeof text !== "string" || text.length > 40) return null;
  if (ALL.size === 0) for (const m of allComposedMessages()) ALL.set(m.zh, m);
  return ALL.get(text) ?? null;
}
