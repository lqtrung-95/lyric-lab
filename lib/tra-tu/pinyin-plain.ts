// Pinyin "phẳng" = chỉ chữ cái a–z, không dấu thanh, không số thanh, không khoảng cách; ü → v ("nǚ" → "nv").
// Hàm SQL `dict_pinyin_plain` trong migration phải cho đúng kết quả này (có test đối chiếu bảng ký tự).
export const TONED = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü";
export const BASE = "aaaaeeeeiiiioooouuuuvvvvv";

export function plainPinyin(text: string): string {
  let out = "";
  for (const ch of text.toLowerCase()) {
    const i = TONED.indexOf(ch);
    const c = i >= 0 ? BASE[i] : ch;
    if (/[a-z]/.test(c)) out += c;
  }
  return out;
}

/** Người gõ "lü"/"lv"/"lu:" đều muốn ü: chuẩn hóa về dạng phẳng của dữ liệu (ü → v). "u:" trong CC-CEDICT cũng là ü. */
export function plainPinyinQuery(text: string): string {
  return plainPinyin(text.replace(/u:/gi, "ü"));
}

/** Khóa so sánh pinyin có dấu: chữ thường, bỏ khoảng trắng, giữ dấu thanh (để thưởng điểm cho kết quả khớp đúng thanh). */
export const toneKey = (pinyin: string): string => pinyin.toLowerCase().replace(/[\s'’-]+/g, "");

const VOWEL_CLASS: Record<string, string> = {
  a: "[aāáǎà]", e: "[eēéěè]", i: "[iīíǐì]", o: "[oōóǒò]", u: "[uūúǔù]", v: "[üǖǘǚǜ]",
};

/** Biểu thức chính quy (POSIX, phân biệt hoa/thường tắt) cho pinyin phẳng, dùng khi cột `pinyin_plain` chưa có: cho phép khoảng trắng giữa các chữ cái. */
export function pinyinRegexFallback(plain: string): string {
  return `^${[...plain].map((c) => VOWEL_CLASS[c] ?? c).join(" ?")}`;
}

/** Có dấu thanh (hoặc số thanh) trong truy vấn không — nếu có thì người dùng muốn đúng thanh đó. */
export const hasPinyinTone = (text: string): boolean => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]|[a-züv][1-5]/i.test(text);
