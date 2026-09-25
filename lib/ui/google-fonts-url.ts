import { ICON_NAMES } from "@/components/ui/icon-names";

/**
 * URL Google Fonts cho toàn app. Chữ Hán (Noto Serif SC) được Google cắt theo unicode-range nên trình duyệt
 * chỉ tải phần glyph cần dùng. Icon chỉ tải đúng danh sách trong ICON_NAMES.
 */
export function googleFontsUrl(): string {
  const families = [
    "family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400",
    "family=Noto+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400",
    "family=Noto+Serif+SC:wght@400;500;600;700",
    "family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0",
  ];
  const icons = [...ICON_NAMES].sort().join(",");
  return `https://fonts.googleapis.com/css2?${families.join("&")}&icon_names=${icons}&display=swap`;
}
