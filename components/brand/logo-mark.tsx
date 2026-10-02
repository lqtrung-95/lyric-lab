// Biểu tượng SongHanzi: ảnh thật (public/songhanzi-mark-light.png, -dark.png), đổi theo class "dark" trên <html>
// (xem components/layout/theme-toggle.tsx). Dùng <img> thường, không qua next/image, vì kích thước hiển thị cố định nhỏ.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/songhanzi-mark-light.png" alt="" width={size} height={size} className="block dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/songhanzi-mark-dark.png" alt="" width={size} height={size} className="hidden dark:block" />
    </span>
  );
}
