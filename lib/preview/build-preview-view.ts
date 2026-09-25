import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { itemKey } from "@/lib/user-state/learner-state";
import { levelLabel } from "./preview-format";

export type LevelFilter = "all" | number | "none";

export interface ViewOptions {
  /** Level của người dùng: mục có cấp thấp hơn bị ẩn (PV-04). */
  userLevel: number;
  known: ReadonlySet<string>;
  levelFilter: LevelFilter;
  /** Hiện cả mục dưới level của người dùng. */
  showEasy: boolean;
}

export interface LevelChip {
  key: LevelFilter;
  label: string;
  count: number;
}

export interface PreviewView {
  vocab: PreviewItem[];
  grammar: PreviewItem[];
  hiddenBelowLevel: number;
  knownCount: number;
  chips: LevelChip[];
}

const isBelow = (item: PreviewItem, userLevel: number) => item.level !== null && item.level < userLevel;

/**
 * Tính danh sách hiển thị của màn xem trước. Đổi level/lọc/"Đã biết" chỉ chạy lại hàm này, không gọi AI (PV-04, PV-05).
 * Mục ngoài HSK (level null) luôn được xem là đáng học.
 */
export function buildPreviewView(items: PreviewItem[], opts: ViewOptions): PreviewView {
  const knownItems = items.filter((i) => opts.known.has(itemKey(i)));
  const unknown = items.filter((i) => !opts.known.has(itemKey(i)));
  const hiddenBelowLevel = opts.showEasy ? 0 : unknown.filter((i) => isBelow(i, opts.userLevel)).length;
  const eligible = opts.showEasy ? unknown : unknown.filter((i) => !isBelow(i, opts.userLevel));

  const counts = new Map<number | "none", number>();
  for (const i of eligible) counts.set(i.level ?? "none", (counts.get(i.level ?? "none") ?? 0) + 1);
  const chips: LevelChip[] = [
    { key: "all", label: "Tất cả", count: eligible.length },
    ...[...counts.entries()]
      .sort(([a], [b]) => (a === "none" ? 1 : b === "none" ? -1 : a - b))
      .map(([level, count]): LevelChip => ({
        key: level,
        label: level === "none" ? levelLabel(null) : levelLabel(level),
        count,
      })),
  ];

  const matches = (i: PreviewItem) =>
    opts.levelFilter === "all" || (opts.levelFilter === "none" ? i.level === null : i.level === opts.levelFilter);
  const visible = eligible.filter(matches).sort((a, b) => b.priority - a.priority);

  return {
    vocab: visible.filter((i) => i.type === "vocab"),
    grammar: visible.filter((i) => i.type === "grammar"),
    hiddenBelowLevel,
    knownCount: knownItems.length,
    chips,
  };
}
