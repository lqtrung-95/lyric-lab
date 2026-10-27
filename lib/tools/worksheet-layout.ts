import { A4, type Segment } from "./writing-paper";

export interface WorksheetChar { ch: string; pinyin: string | null; sinoViet: string | null }

export type WorksheetGrid = "tianzige" | "mizige" | "square";

export interface WorksheetOptions {
  grid: WorksheetGrid;
  /** Số ô mờ để tô theo, ngay sau chữ mẫu. */
  traceCells: number;
  showPinyin: boolean;
  showSinoViet: boolean;
}

export interface WorksheetRow { char: WorksheetChar; y: number }
export interface WorksheetPage { rows: WorksheetRow[]; segments: Segment[] }

export const MAX_WORKSHEET_CHARS = 60;
export const TRACE_RANGE = { min: 1, max: 8 } as const;

/** Bố cục cố định của tờ tập viết A4: lề, cột thông tin bên trái, ô chữ và tiêu đề. */
export const SHEET = { margin: 10, header: 14, infoW: 30, cell: 14 } as const;

/** Tách các chữ Hán duy nhất (giữ thứ tự xuất hiện) từ văn bản nhập; bỏ dấu câu, số, chữ Latin, tối đa `MAX_WORKSHEET_CHARS`. */
export function uniqueHanChars(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) if (/\p{Script=Han}/u.test(ch) && !out.includes(ch)) out.push(ch);
  return out.slice(0, MAX_WORKSHEET_CHARS);
}

export const cellsPerRow = (): number => Math.floor((A4.widthMm - 2 * SHEET.margin - SHEET.infoW) / SHEET.cell);
export const rowsPerPage = (): number => Math.floor((A4.heightMm - 2 * SHEET.margin - SHEET.header) / SHEET.cell);

/** Đường kẻ của một hàng ô chữ bắt đầu ở (x, y): viền liền, chữ thập (và chéo với 米字格) nét đứt. */
function rowSegments(x: number, y: number, cols: number, grid: WorksheetGrid): Segment[] {
  const c = SHEET.cell;
  const segs: Segment[] = [{ x1: x, y1: y, x2: x + cols * c, y2: y }, { x1: x, y1: y + c, x2: x + cols * c, y2: y + c }];
  for (let i = 0; i <= cols; i++) segs.push({ x1: x + i * c, y1: y, x2: x + i * c, y2: y + c });
  if (grid === "square") return segs;
  for (let i = 0; i < cols; i++) {
    const cx = x + i * c;
    segs.push({ x1: cx + c / 2, y1: y, x2: cx + c / 2, y2: y + c, dashed: true }, { x1: cx, y1: y + c / 2, x2: cx + c, y2: y + c / 2, dashed: true });
    if (grid === "mizige") segs.push({ x1: cx, y1: y, x2: cx + c, y2: y + c, dashed: true }, { x1: cx + c, y1: y, x2: cx, y2: y + c, dashed: true });
  }
  return segs;
}

/** Chia các chữ thành các trang A4: mỗi chữ một hàng (chữ mẫu, các ô mờ để tô, rồi ô trống để tự viết), kèm đường kẻ của từng hàng. */
export function worksheetPages(chars: readonly WorksheetChar[], options: WorksheetOptions): WorksheetPage[] {
  const per = rowsPerPage();
  const cols = cellsPerRow();
  const x = SHEET.margin + SHEET.infoW;
  const pages: WorksheetPage[] = [];
  for (let start = 0; start < chars.length; start += per) {
    const rows: WorksheetRow[] = [];
    const segments: Segment[] = [];
    chars.slice(start, start + per).forEach((char, i) => {
      const y = SHEET.margin + SHEET.header + i * SHEET.cell;
      rows.push({ char, y });
      segments.push(...rowSegments(x, y, cols, options.grid));
    });
    pages.push({ rows, segments });
  }
  return pages;
}
