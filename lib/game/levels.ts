/** Cấp độ từ tổng XP: đường cong tăng dần, tổng XP để ĐẠT cấp n là 30·(n−1)² + 20·(n−1). */
export const MAX_LEVEL = 50;

export const xpToReachLevel = (n: number): number => 30 * (n - 1) ** 2 + 20 * (n - 1);

const NAMES: { from: number; name: string }[] = [
  { from: 1, name: "Mầm chữ" },
  { from: 3, name: "Học trò" },
  { from: 5, name: "Thư sinh" },
  { from: 8, name: "Tú tài" },
  { from: 12, name: "Cử nhân" },
  { from: 17, name: "Tiến sĩ" },
  { from: 23, name: "Trạng nguyên" },
  { from: 31, name: "Văn hào" },
  { from: 41, name: "Đại sư" },
  { from: 50, name: "Thánh thư" },
];

/** Tên cấp theo khoảng cấp. */
export const levelName = (n: number): string => [...NAMES].reverse().find((x) => n >= x.from)?.name ?? NAMES[0].name;

/** Cấp mở huy hiệu "Thăng cấp" (xem badge-catalog). */
export const LEVEL_MILESTONES = [5, 10, 20, 30] as const;

export interface LevelInfo {
  n: number;
  name: string;
  /** XP đã có trong cấp hiện tại. */
  progressXp: number;
  /** XP cần để đi hết cấp hiện tại (0 khi đã tối đa). */
  nextXp: number;
  maxed: boolean;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let n = 1;
  while (n < MAX_LEVEL && xp >= xpToReachLevel(n + 1)) n++;
  const maxed = n >= MAX_LEVEL;
  return { n, name: levelName(n), progressXp: xp - xpToReachLevel(n), nextXp: maxed ? 0 : xpToReachLevel(n + 1) - xpToReachLevel(n), maxed };
}
