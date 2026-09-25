import { DEFAULT_LEVEL, type LearnerState, type SavedItem } from "@/lib/user-state/learner-state";

/** Thay đổi cần ghi lên Supabase để bản từ xa khớp trạng thái cục bộ mới. */
export interface SyncOps {
  level?: number;
  knownAdd: string[];
  knownRemove: string[];
  cardsAdd: SavedItem[];
  cardsRemove: string[];
}

export const isEmptyOps = (o: SyncOps) =>
  o.level === undefined && !o.knownAdd.length && !o.knownRemove.length && !o.cardsAdd.length && !o.cardsRemove.length;

/** So hai trạng thái cục bộ, trả các thao tác cần đẩy lên. */
export function diffLearnerState(prev: LearnerState, next: LearnerState): SyncOps {
  const prevKnown = new Set(prev.known);
  const nextKnown = new Set(next.known);
  const prevCards = new Set(prev.saved.map((c) => c.key));
  const nextCards = new Set(next.saved.map((c) => c.key));
  return {
    level: prev.level !== next.level ? next.level : undefined,
    knownAdd: next.known.filter((k) => !prevKnown.has(k)),
    knownRemove: prev.known.filter((k) => !nextKnown.has(k)),
    cardsAdd: next.saved.filter((c) => !prevCards.has(c.key)),
    cardsRemove: prev.saved.filter((c) => !nextCards.has(c.key)).map((c) => c.key),
  };
}

/** Toàn bộ trạng thái coi như thêm mới: dùng khi nhập dữ liệu localStorage cũ lên tài khoản mới. */
export const opsFromState = (s: LearnerState): SyncOps => ({
  ...diffLearnerState({ level: s.level, known: [], saved: [] }, s),
  level: s.level,
});

export interface CardRow {
  item_key: string;
  kind: "vocab" | "grammar";
  term: string;
  pinyin: string | null;
  han_viet: string | null;
  hsk_level: number | null;
  meaning: string;
  video_id: string | null;
  line_index: number | null;
  created_at: string;
}

/**
 * Hàng thẻ mới (FSRS ở trạng thái New nhờ giá trị mặc định của bảng). Thẻ cũ thiếu nghĩa thì bỏ qua (null):
 * không có gì để hiện ở mặt sau thẻ.
 */
export function cardRowFromSaved(item: SavedItem): (CardRow & Record<string, unknown>) | null {
  if (!item.meaning) return null;
  return {
    item_key: item.key, kind: item.type, term: item.term,
    pinyin: item.reading ?? null, han_viet: item.sinoViet ?? null, hsk_level: item.level ?? null,
    meaning: item.meaning, video_id: item.videoId, line_index: item.lineIndex,
    created_at: new Date(item.savedAt).toISOString(),
  };
}

export function savedFromRow(row: CardRow): SavedItem {
  return {
    key: row.item_key, videoId: row.video_id ?? "", type: row.kind, term: row.term,
    lineIndex: row.line_index ?? 0, start: 0, savedAt: Date.parse(row.created_at),
    reading: row.pinyin ?? undefined, sinoViet: row.han_viet ?? undefined, level: row.hsk_level, meaning: row.meaning,
  };
}

export interface RemoteLearner {
  /** null = chưa có hồ sơ (tài khoản mới, cần nhập dữ liệu cũ). */
  level: number | null;
  known: string[];
  cards: CardRow[];
}

export function stateFromRemote(remote: RemoteLearner): LearnerState {
  return { level: remote.level ?? DEFAULT_LEVEL, known: remote.known, saved: remote.cards.map(savedFromRow) };
}
