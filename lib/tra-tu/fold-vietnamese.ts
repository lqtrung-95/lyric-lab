/** Bỏ dấu tiếng Việt, đ → d, về chữ thường, gộp khoảng trắng: so khớp "thành thị" với "thanh thi". */
export function foldVietnamese(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
