// Biểu tượng Lyric Lab: nốt nhạc trắng có đuôi như nét bút lông trên nền ô vuông bo tròn màu son, kèm một chấm ngọc lam
// (như chữ Hán được tô sáng trong lời hát). Mỗi phiên bản dùng id gradient riêng để nhúng nhiều lần trong trang không xung đột.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-mark-bg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9452F" />
          <stop offset="1" stopColor="#8A1F10" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#logo-mark-bg)" />
      <rect x="1.75" y="1.75" width="36.5" height="36.5" rx="10.25" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.5" />
      <ellipse cx="15.5" cy="28" rx="5.6" ry="4.1" transform="rotate(-24 15.5 28)" fill="#FFF8F4" />
      <rect x="19.6" y="9" width="3.2" height="19" rx="1.6" fill="#FFF8F4" />
      <path d="M21.4 9C26.6 9.7 30.6 12.6 30.2 18.2C30 20.7 28.6 22.4 26.8 23.6C27.9 20.4 26.6 17.7 21.4 16.2Z" fill="#FFF8F4" />
      <circle cx="30.2" cy="30.4" r="2.9" fill="#B4EDEC" />
    </svg>
  );
}
