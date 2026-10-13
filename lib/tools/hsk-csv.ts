import type { HskRow } from "./build-hsk-rows";

const cell = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** CSV của bảng từ vựng (cột: Từ, Pinyin, Hán Việt, Nghĩa) để nạp vào Anki hoặc bảng tính; các nghĩa ngăn nhau bằng "; ". Không có BOM (thêm lúc tải xuống). */
export function buildHskCsv(rows: HskRow[]): string {
  const lines = [["Từ", "Pinyin", "Hán Việt", "Nghĩa"], ...rows.map((r) => [r.word, r.pinyin, r.sinoViet ?? "", r.meanings.join("; ")])];
  return lines.map((l) => l.map(cell).join(",")).join("\r\n");
}
