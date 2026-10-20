import Image from "next/image";

/**
 * Biểu tượng SongHanzi: ô cam có viền mực, chữ 歌; cùng một ảnh cho cả hai theme.
 * Dùng ảnh 96px dựng sẵn và `unoptimized` (hiển thị ≤ 48px, nét cho màn 2x): để trình tối ưu ảnh của Vercel không biến mỗi kích thước/định dạng thành một lượt
 * "Image Transformation" (gói miễn phí chỉ 5.000 lượt/tháng).
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <Image src="/songhanzi-mark-96.png" alt="" width={size} height={size} unoptimized className="block" />
    </span>
  );
}
