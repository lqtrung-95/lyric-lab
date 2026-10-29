/**
 * Thẻ khoe pet: số liệu hiển thị và các phần trang trí cố định (vị trí lấp lánh, giấy confetti) dùng chung cho thẻ trên màn hình và ảnh PNG,
 * để hai nơi giống nhau. Mọi vị trí tính theo chỉ số (không ngẫu nhiên) nên kiểm thử được và không giật giữa các lần vẽ.
 */
export interface ShareStats { level: number; streak: number; xpSince: number; daysTogether: number; taughtWords: number }

/** Số ngày bên nhau, tối thiểu 1 (ngày nhận nuôi tính là ngày đầu). */
export function daysTogether(adoptedAt: string, now: number): number {
  const t = Date.parse(adoptedAt);
  if (Number.isNaN(t) || now <= t) return 1;
  return Math.floor((now - t) / 86_400_000) + 1;
}

/** XP gọn: 950 → "950", 1240 → "1,2k". */
export function compactXp(xp: number): string {
  const n = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  return n < 1000 ? String(n) : `${(n / 1000).toFixed(1).replace(".", ",").replace(/,0$/, "")}k`;
}

export interface ShareChip { label: string; value: string }

/** Các ô số liệu trên thẻ (bỏ ô chưa có nghĩa như chuỗi 0 hay chưa dạy từ nào). */
export function shareChips(s: ShareStats): ShareChip[] {
  const chips: ShareChip[] = [{ label: "Cấp", value: String(s.level) }];
  if (s.streak > 0) chips.push({ label: "Chuỗi ngày", value: String(s.streak) });
  chips.push({ label: "XP cùng nhau", value: compactXp(s.xpSince) });
  chips.push({ label: "Bên nhau", value: `${s.daysTogether} ngày` });
  if (s.taughtWords > 0) chips.push({ label: "Từ đã dạy", value: String(s.taughtWords) });
  return chips;
}

export interface Sparkle { x: number; y: number; size: number; delay: number }

/** Vị trí lấp lánh (x, y tính theo %, size theo rem tương đối 0.6..1.5, delay theo giây) xếp rải đều, chừa vùng giữa cho pet. */
export function sparkles(count = 14): Sparkle[] {
  return Array.from({ length: count }, (_, i) => {
    const a = i * 2.399963; // góc vàng: rải đều không thành hàng
    const r = 0.34 + ((i * 37) % 11) / 11 * 0.14;
    return { x: Math.round(50 + Math.cos(a) * r * 190), y: Math.round(46 + Math.sin(a) * r * 170), size: 0.6 + ((i * 5) % 7) * 0.13, delay: Math.round(((i * 13) % 17)) / 10 };
  }).map((s) => ({ ...s, x: Math.min(96, Math.max(4, s.x)), y: Math.min(94, Math.max(4, s.y)) }));
}

export interface Confetti { x: number; delay: number; duration: number; hue: number; spin: number; w: number }

/** Giấy confetti rơi một lần khi thẻ mở ra. */
export function confetti(count = 26): Confetti[] {
  return Array.from({ length: count }, (_, i) => ({
    x: (i * 41) % 100,
    delay: ((i * 7) % 10) / 10,
    duration: 1.6 + ((i * 11) % 8) / 5,
    hue: (i * 47) % 360,
    spin: 180 + ((i * 53) % 540),
    w: 6 + ((i * 3) % 5),
  }));
}

export const shareFileName = (petName: string): string => `songhanzi-${petName.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "pet"}.png`;

/**
 * Chia các ô số liệu thành hàng cân đối: 2 ô một hàng, 3 ô một hàng, 4 ô thành 2×2 (không để 3+1 lệch), 5 ô thành 3+2. Trả số ô của từng hàng.
 */
export function chipRows(count: number): number[] {
  if (count <= 3) return count > 0 ? [count] : [];
  if (count === 4) return [2, 2];
  return [3, count - 3];
}
