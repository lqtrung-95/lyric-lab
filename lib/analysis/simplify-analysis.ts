import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";

const HAN = /[㐀-鿿]/;

/**
 * Chuyển mọi chuỗi có chữ Hán về giản thể (người học chỉ học giản thể). Lời từ LRCLIB/caption có thể là phồn thể
 * nên chuyển ở lúc đọc: cache cũ cũng đúng ngay, không cần phân tích lại. Toàn bộ chuỗi (câu, token, từ, ví dụ, giải thích)
 * đi qua cùng một hàm nên khớp nhau. Chuỗi mà độ dài đổi sau khi chuyển thì giữ nguyên, vì vị trí ký tự
 * (ranges trong occurrences) tính theo chỉ số.
 */
export function simplifyDeep<T>(value: T): T {
  if (typeof value === "string") {
    if (!HAN.test(value)) return value;
    const converted = toSimplifiedChinese(value);
    return (converted.length === value.length ? converted : value) as T;
  }
  if (Array.isArray(value)) return value.map(simplifyDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, simplifyDeep(v)])) as T;
  }
  return value;
}
