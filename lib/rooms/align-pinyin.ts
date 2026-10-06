const HAN = /\p{Script=Han}/u;
const PUNCT_ONLY = /^[\p{P}\p{S}\d]+$/u;

export interface PinyinChar {
  ch: string;
  /** Âm tiết của chữ Hán này; null với ký tự không phải chữ Hán. */
  py: string | null;
}

/**
 * Ghép từng âm tiết pinyin vào đúng chữ Hán của một đoạn lời (để hiện pinyin ngay trên chữ, kiểu ruby). Pinyin dòng có một âm tiết
 * cho mỗi chữ Hán, ngăn bằng dấu cách; token chỉ gồm dấu câu/số bị bỏ qua khi đếm. Trả null khi số âm tiết không khớp số chữ Hán
 * (nơi gọi khi đó hiện pinyin thành một dòng riêng thay vì căn sai chữ).
 */
export function alignPinyinToText(text: string, pinyin: string | null): PinyinChar[] | null {
  if (pinyin === null) return null;
  const chars = [...text];
  const hanCount = chars.filter((c) => HAN.test(c)).length;
  const tokens = pinyin.split(/\s+/).filter(Boolean);
  const syllables = tokens.length === hanCount ? tokens : tokens.filter((t) => !PUNCT_ONLY.test(t));
  if (syllables.length !== hanCount) return null;
  let i = 0;
  return chars.map((ch) => ({ ch, py: HAN.test(ch) ? syllables[i++] : null }));
}
