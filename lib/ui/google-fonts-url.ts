import { ICON_NAMES } from "@/components/ui/icon-names";

/**
 * URL Google Fonts chỉ cho icon (Material Symbols). Chữ được tự host bằng `next/font` trong layout.
 * Icon chỉ tải đúng danh sách trong ICON_NAMES.
 */
export function googleFontsUrl(): string {
  const families = [
    "family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0",
  ];
  const icons = [...ICON_NAMES].sort().join(",");
  return `https://fonts.googleapis.com/css2?${families.join("&")}&icon_names=${icons}&display=swap`;
}
