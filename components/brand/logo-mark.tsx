// Biểu tượng Lyric Lab (từ design/logo.svg, bỏ phần chữ để dùng chữ thật theo font trang).
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 44" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="32" height="32" rx="8" fill="#B23A26" />
      <path d="M14 26C14 24 16 22 19 22C20.5 22 21.8 22.6 22.5 23.5V12L28 10.5V14L22.5 15.5V25C22.5 27.5 20.5 29.5 18 29.5C15.5 29.5 14 28 14 26Z" fill="#FFF8F4" />
      <circle cx="18" cy="26" r="2.5" fill="#FFF8F4" />
      <rect x="11" y="10" width="3" height="3" rx="0.5" fill="#FFF8F4" opacity="0.6" />
    </svg>
  );
}
