/** Kích thước logo trên thẻ chia sẻ vẽ bằng canvas, và khoảng đẩy chữ "SongHanzi" sang phải khi có logo. */
export const BRAND_MARK_SIZE = 64;
export const BRAND_TEXT_OFFSET = BRAND_MARK_SIZE + 20;

let pending: Promise<HTMLImageElement | null> | null = null;

/** Nạp logo (cùng nguồn gốc nên không làm canvas bị "tainted"); lỗi thì null để thẻ vẫn vẽ được chỉ với chữ. */
export function loadBrandMark(): Promise<HTMLImageElement | null> {
  pending ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/songhanzi-mark-96.png";
  });
  return pending;
}

/** Vẽ logo bên trái dòng chữ có đường cơ sở `baselineY` (cỡ chữ ~44px); trả khoảng đẩy chữ sang phải (0 nếu không có logo). */
export function drawBrandMark(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, baselineY: number): number {
  if (!img) return 0;
  ctx.drawImage(img, x, baselineY - 48, BRAND_MARK_SIZE, BRAND_MARK_SIZE);
  return BRAND_TEXT_OFFSET;
}
