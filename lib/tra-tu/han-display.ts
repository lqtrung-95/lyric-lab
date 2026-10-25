/** Cỡ chữ Hán lớn theo độ dài từ để từ dài (tối đa 8 chữ) vẫn vừa màn điện thoại 390px không tràn ngang. */
export function hanSizeClass(length: number): string {
  if (length <= 1) return "text-8xl";
  if (length === 2) return "text-7xl";
  if (length <= 4) return "text-5xl";
  return "text-3xl";
}

/** Nhãn cấp HSK: cấp 7 trong dữ liệu là nhóm 7–9 của HSK 3.0. */
export const hskLabel = (level: number): string => (level >= 7 ? "HSK 7–9" : `HSK ${level}`);
