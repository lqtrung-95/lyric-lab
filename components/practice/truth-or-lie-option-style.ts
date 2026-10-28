/**
 * Giao diện một lựa chọn của Hai thật một giả, dùng chung cho chơi đơn và chơi đôi.
 * Sau khi lộ đáp án: câu SAI (đáp án) nền xanh đậm viền dày + dấu ✓, câu bạn chọn nhầm nền đỏ + dấu ✗,
 * câu đúng còn lại mờ đi. Màu luôn đi kèm dấu và chữ nên không chỉ dựa vào màu.
 */
export type TruthOptionKind = "idle" | "selected" | "lie" | "wrong-pick" | "other";

const BASE = "min-h-14 min-w-0 flex-1 rounded-xl border-2 px-space-sm py-2 text-left disabled:cursor-default";

const KIND: Record<TruthOptionKind, { box: string; badge: string | null; badgeClass: string }> = {
  idle: { box: "border-ink bg-surface-container-lowest", badge: null, badgeClass: "" },
  selected: { box: "border-primary bg-primary-container", badge: null, badgeClass: "" },
  lie: { box: "border-secondary bg-secondary-container ring-4 ring-secondary/40", badge: "✓ Câu SAI (đáp án)", badgeClass: "bg-secondary text-on-secondary" },
  "wrong-pick": { box: "border-error bg-error-container ring-4 ring-error/30", badge: "✗ Câu đúng, bạn chọn nhầm", badgeClass: "bg-error text-on-error" },
  other: { box: "border-outline-variant bg-surface-container-lowest opacity-60", badge: "Câu đúng", badgeClass: "bg-surface-container-high text-on-surface" },
};

export function truthOptionClass(kind: TruthOptionKind): string {
  return `${BASE} ${KIND[kind].box}`;
}

export function truthOptionBadge(kind: TruthOptionKind): { text: string; className: string } | null {
  const k = KIND[kind];
  return k.badge ? { text: k.badge, className: `mt-1 inline-block rounded-full px-3 py-0.5 text-label-md font-extrabold ${k.badgeClass}` } : null;
}
