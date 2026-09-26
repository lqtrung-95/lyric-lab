import { ICON_NAMES } from "@/components/ui/icon-names";

/**
 * URL Google Fonts cho chữ Hán (Noto Serif SC, Google cắt theo unicode-range nên chỉ tải glyph cần dùng) và icon
 * (chỉ đúng danh sách trong ICON_NAMES). Chữ Latin/tiếng Việt được tự host bằng `next/font` trong layout.
 */
export function googleFontsUrl(): string {
  const families = [
    "family=Noto+Serif+SC:wght@400;500;600;700",
    "family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0",
  ];
  const icons = [...ICON_NAMES].sort().join(",");
  return `https://fonts.googleapis.com/css2?${families.join("&")}&icon_names=${icons}&display=swap`;
}
