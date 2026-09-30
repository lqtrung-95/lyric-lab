import { ICON_NAMES } from "@/components/ui/icon-names";

/**
 * URL Google Fonts cho chữ Hán (Noto Serif SC, Google cắt theo unicode-range nên chỉ tải glyph cần dùng). Chữ
 * Latin/tiếng Việt được tự host bằng `next/font` trong layout. `display=swap`: thấy chữ dự phòng ngay, đỡ phải
 * chờ, chữ Hán dự phòng vẫn đọc được nên không sao.
 */
export function googleFontsUrl(): string {
  return "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap";
}

/**
 * URL riêng cho font icon (Material Symbols, chỉ đúng danh sách trong ICON_NAMES) — tách khỏi `googleFontsUrl` vì
 * cần `display=block` riêng: icon là ligature (tên icon chính là chữ thật, vd. "arrow_forward"), nếu dùng `swap`
 * như chữ Hán thì trước khi font tải xong sẽ hiện nguyên chữ "arrow_forward" rồi mới đổi sang icon, gây giật layout.
 * `block` giấu tạm (ẩn, không giữ chỗ theo chữ) rồi hiện đúng icon luôn khi tải xong.
 */
export function iconFontUrl(): string {
  const icons = [...ICON_NAMES].sort().join(",");
  return `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&icon_names=${icons}&display=block`;
}
