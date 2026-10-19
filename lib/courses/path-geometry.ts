// Hình học của bản đồ lộ trình dạng đường đi: các chặng nằm trên một con đường uốn lượn dọc xuống. Hàm thuần để test được.
export interface PathPoint { /** Phần trăm bề ngang khung (0-100). */ x: number; /** Pixel tính từ đỉnh khung. */ y: number }

export const ROW_HEIGHT = 108;
const AMPLITUDE = 27;
const PERIOD = 0.95;

/** Vị trí tâm của `count` nút: y cách đều theo `rowHeight`, x dao động quanh giữa khung (sin) để đường uốn lượn. */
export function nodePositions(count: number, rowHeight = ROW_HEIGHT): PathPoint[] {
  return Array.from({ length: count }, (_, i) => ({ x: 50 + AMPLITUDE * Math.sin(i * PERIOD), y: (i + 0.5) * rowHeight }));
}

/** Đường cong mượt đi qua mọi điểm (Bézier bậc ba, tiếp tuyến thẳng đứng tại từng nút). Trả chuỗi `d` của SVG với x theo phần trăm (viewBox 0..100) và y theo pixel. */
export function roadPath(points: PathPoint[]): string {
  if (points.length === 0) return "";
  const f = (n: number) => Number(n.toFixed(2));
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const mid = (a.y + b.y) / 2;
    d += ` C ${f(a.x)} ${f(mid)} ${f(b.x)} ${f(mid)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

/** Chiều cao khung bản đồ để chứa đủ `count` hàng. */
export const mapHeight = (count: number, rowHeight = ROW_HEIGHT): number => count * rowHeight;
