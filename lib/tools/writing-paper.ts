export type PaperType = "tianzige" | "mizige" | "square" | "pinyin";

export const PAPER_TYPES: readonly { id: PaperType; label: string; hint: string }[] = [
  { id: "tianzige", label: "Ô 田字格 (điền tự cách)", hint: "Ô vuông có chữ thập chia bốn phần, giúp đặt đúng vị trí nét." },
  { id: "mizige", label: "Ô 米字格 (mễ tự cách)", hint: "Như 田字格 và thêm hai đường chéo để căn chữ có nét xiên." },
  { id: "square", label: "Ô vuông trơn 方格", hint: "Chỉ có ô vuông, hợp để viết bài hoặc tập chép đoạn văn." },
  { id: "pinyin", label: "Pinyin + 田字格", hint: "Mỗi hàng có dòng pinyin bốn dòng ba ô phía trên ô chữ." },
];

export const PAPER_COLORS = { gray: "#9a9a9a", red: "#d9534f", green: "#2e9e5b" } as const;
export type PaperColor = keyof typeof PAPER_COLORS;

export const A4 = { widthMm: 210, heightMm: 297 } as const;

export interface PaperOptions { type: PaperType; /** Cạnh một ô chữ (mm). */ cellMm: number; /** Lề bốn phía (mm). */ marginMm: number }
export interface Segment { x1: number; y1: number; x2: number; y2: number; /** Nét đứt (đường phụ). */ dashed?: boolean }
export interface PaperLayout { cols: number; rows: number; segments: Segment[] }

export const CELL_RANGE = { min: 10, max: 30 } as const;
export const MARGIN_RANGE = { min: 5, max: 25 } as const;
/** Chiều cao dải pinyin (bốn dòng ba ô) so với cạnh ô chữ. */
const PINYIN_STRIP = 0.7;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Tính các đoạn thẳng của một trang giấy tập viết khổ A4 (tọa độ mm): số cột và hàng vừa trang, đường kẻ ngoài liền, đường phụ (chữ thập, đường chéo, dòng giữa pinyin) nét đứt.
 * Tách riêng khỏi giao diện để kiểm thử và để cùng một hàm vẽ cả bản xem trước lẫn bản in.
 */
export function paperLayout(options: PaperOptions): PaperLayout {
  const cell = clamp(options.cellMm, CELL_RANGE.min, CELL_RANGE.max);
  const margin = clamp(options.marginMm, MARGIN_RANGE.min, MARGIN_RANGE.max);
  const strip = options.type === "pinyin" ? cell * PINYIN_STRIP : 0;
  const rowH = cell + strip;
  const cols = Math.max(1, Math.floor((A4.widthMm - 2 * margin) / cell));
  const rows = Math.max(1, Math.floor((A4.heightMm - 2 * margin) / rowH));
  // Căn giữa lưới trong trang.
  const left = (A4.widthMm - cols * cell) / 2;
  const top = (A4.heightMm - rows * rowH) / 2;
  const right = left + cols * cell;
  const segments: Segment[] = [];

  for (let r = 0; r < rows; r++) {
    const y0 = top + r * rowH;
    if (strip > 0) {
      // Dải pinyin: bốn dòng ngang cách đều, hai dòng giữa nét đứt.
      for (let k = 0; k < 4; k++) {
        const y = y0 + (strip * k) / 3;
        segments.push({ x1: left, y1: y, x2: right, y2: y, dashed: k === 1 || k === 2 });
      }
    }
    const gy = y0 + strip;
    segments.push({ x1: left, y1: gy, x2: right, y2: gy });
    segments.push({ x1: left, y1: gy + cell, x2: right, y2: gy + cell });
    for (let c = 0; c <= cols; c++) segments.push({ x1: left + c * cell, y1: gy, x2: left + c * cell, y2: gy + cell });
    if (options.type === "square") continue;
    for (let c = 0; c < cols; c++) {
      const x = left + c * cell;
      segments.push({ x1: x + cell / 2, y1: gy, x2: x + cell / 2, y2: gy + cell, dashed: true });
      segments.push({ x1: x, y1: gy + cell / 2, x2: x + cell, y2: gy + cell / 2, dashed: true });
      if (options.type === "mizige") {
        segments.push({ x1: x, y1: gy, x2: x + cell, y2: gy + cell, dashed: true });
        segments.push({ x1: x + cell, y1: gy, x2: x, y2: gy + cell, dashed: true });
      }
    }
  }
  return { cols, rows, segments };
}
