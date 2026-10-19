import Image from "next/image";

/** Biểu tượng SongHanzi: ô cam có viền mực, chữ 歌; cùng một ảnh cho cả hai theme. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <Image src="/songhanzi-mark.png" alt="" width={size} height={size} className="block" />
    </span>
  );
}
