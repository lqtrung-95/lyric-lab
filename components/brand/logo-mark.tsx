import Image from "next/image";

/** Biểu tượng SongHanzi: tự chọn nền kem hoặc nâu mực theo theme hiện tại. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <Image
        src="/songhanzi-mark-light.png"
        alt=""
        width={size}
        height={size}
        className="block dark:hidden"
      />
      <Image
        src="/songhanzi-mark-dark.png"
        alt=""
        width={size}
        height={size}
        className="hidden dark:block"
      />
    </span>
  );
}
