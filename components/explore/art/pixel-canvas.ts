// Bộ dựng sprite pixel bằng code (Tranh B): vẽ chồng các hình chữ nhật lên một lưới ký tự, mỗi ký tự là một màu trong bảng màu PALETTE.
// Dựng bằng lệnh thay vì gõ tay từng hàng để không lệch độ dài hàng và dễ chỉnh.

export const PALETTE: Record<string, string> = {
  k: "#3a2a22", // viền
  w: "#b9773f", W: "#d89c5c", d: "#8a5530", // gỗ vừa / sáng / tối
  g: "#6aa84f", G: "#4a7f3a", l: "#a8d38b", // xanh lá vừa / tối / sáng
  c: "#f6ead2", C: "#e0cfae", // kem
  r: "#cf4a3e", R: "#962f2f", // đỏ
  y: "#f2c14e", Y: "#c9962b", // vàng
  b: "#6aa0d8", B: "#3d6ea8", a: "#bfe3f2", // xanh dương, nước
  s: "#a9aeb4", S: "#6a7078", // xám
  o: "#e3913f", O: "#b86a22", // cam
  h: "#ffffff", n: "#2a2a2e", p: "#e9a0b4",
  t: "#c97a4a", T: "#9d5a34", // đất nung
};

export interface PixelSprite {
  w: number;
  h: number;
  rows: string[];
}

export class Canvas {
  private grid: string[][];
  constructor(readonly w: number, readonly h: number) {
    this.grid = Array.from({ length: h }, () => Array<string>(w).fill("."));
  }
  px(x: number, y: number, c: string): this {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.grid[y][x] = c;
    return this;
  }
  fill(x: number, y: number, w: number, h: number, c: string): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c);
    return this;
  }
  /** Hình chữ nhật có viền `k` và ruột `c`. */
  box(x: number, y: number, w: number, h: number, c: string, edge = "k"): this {
    this.fill(x, y, w, h, edge);
    return this.fill(x + 1, y + 1, w - 2, h - 2, c);
  }
  done(): PixelSprite {
    return { w: this.w, h: this.h, rows: this.grid.map((r) => r.join("")) };
  }
}

export interface Rect { x: number; y: number; w: number; h: number; fill: string }

/** Gộp các ô liền nhau cùng màu trên một hàng thành một hình chữ nhật để SVG nhẹ hơn. */
export function toRects(sprite: PixelSprite): Rect[] {
  const rects: Rect[] = [];
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = PALETTE[ch];
      if (ch !== "." && fill) rects.push({ x, y, w: end - x, h: 1, fill });
      x = end;
    }
  });
  return rects;
}
