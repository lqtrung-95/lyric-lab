import { COOP_PLACES } from "./coop-places";

/**
 * Câu nói có chỗ trống của chế độ chơi chung: người chơi chọn mẫu câu và điền nơi chốn (một cảnh của vụ án) để nói chuyện bằng tiếng Trung với đồng đội.
 * Không có chữ gõ tự do nên không cần kiểm duyệt: tin nhận được chỉ hợp lệ khi khớp đúng một mẫu và một nơi chốn trong danh sách.
 * `{p}` là chỗ điền nơi chốn.
 */
export interface MessageTemplate { id: string; zh: string; vi: string; slot: boolean }

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: "at", zh: "我在{p}。", vi: "Tôi đang ở {p}.", slot: true },
  { id: "goto", zh: "你去{p}看看。", vi: "Bạn đến {p} xem thử.", slot: true },
  { id: "found", zh: "我在{p}找到了线索。", vi: "Tôi tìm được manh mối ở {p}.", slot: true },
  { id: "liar", zh: "我觉得{p}的人在说谎。", vi: "Tôi nghĩ người ở {p} đang nói dối.", slot: true },
  { id: "yours", zh: "你那边有什么线索?", vi: "Bên bạn có manh mối gì?", slot: false },
  { id: "again", zh: "请再说一遍。", vi: "Xin nói lại một lần.", slot: false },
  { id: "agree", zh: "我同意。", vi: "Tôi đồng ý.", slot: false },
  { id: "disagree", zh: "我不同意。", vi: "Tôi không đồng ý.", slot: false },
  { id: "ready", zh: "我们可以指认了吗?", vi: "Chúng ta có thể buộc tội chưa?", slot: false },
];

export interface ComposedMessage { zh: string; vi: string }

/** Ghép một mẫu với nơi chốn (id cảnh); mẫu cần chỗ trống mà thiếu hoặc sai nơi chốn thì null. */
export function composeMessage(templateId: string, placeId?: string): ComposedMessage | null {
  const t = MESSAGE_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return null;
  if (!t.slot) return { zh: t.zh, vi: t.vi };
  const place = placeId ? COOP_PLACES[placeId] : undefined;
  return place ? { zh: t.zh.replace("{p}", place.zh), vi: t.vi.replace("{p}", place.vi) } : null;
}

/** Mọi câu ghép được từ các mẫu và các nơi chốn (dùng để tổng hợp sẵn giọng đọc và kiểm tra tin nhận được). */
export function allComposedMessages(): ComposedMessage[] {
  return MESSAGE_TEMPLATES.flatMap((t) => (t.slot ? Object.keys(COOP_PLACES).flatMap((id) => composeMessage(t.id, id) ?? []) : composeMessage(t.id) ?? []));
}

/** Tin nhận được qua kênh: chỉ chấp nhận câu khớp đúng một câu ghép hợp lệ (trả lại câu tiếng Trung và nghĩa). Chữ lạ từ người ngoài bị bỏ. */
export function parseMessage(text: unknown, places: readonly string[] = Object.keys(COOP_PLACES)): ComposedMessage | null {
  if (typeof text !== "string" || text.length > 40) return null;
  for (const t of MESSAGE_TEMPLATES) {
    if (!t.slot) { if (t.zh === text) return { zh: t.zh, vi: t.vi }; continue; }
    for (const id of places) {
      const m = composeMessage(t.id, id);
      if (m?.zh === text) return m;
    }
  }
  return null;
}
