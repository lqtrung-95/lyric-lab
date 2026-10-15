// Minh họa từng bước cài app: sơ đồ vẽ tay bằng SVG (không phải ảnh chụp màn hình thật của iOS/Android, vì giao diện đổi theo phiên bản và ngôn ngữ), chỉ cái nút/dòng cần bấm bằng
// khung màu chính. Dùng màu theo chủ đề của app nên tự đổi theo chế độ sáng/tối. Chỉ để trang trí: lời hướng dẫn nằm ở chữ bên cạnh nên ẩn khỏi trình đọc màn hình.
import type { ReactNode } from "react";

const TEXT = "fill-on-surface-variant text-[9px]";
const HI = "fill-primary/15 stroke-primary";

function Art({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 260 150" aria-hidden="true" focusable="false" className="h-auto w-full max-w-[260px] rounded-xl bg-surface-container-high">
      <rect x="52" y="6" width="156" height="138" rx="16" className="fill-surface-container-lowest stroke-outline-variant" strokeWidth="1.5" />
      {children}
    </svg>
  );
}

/** Biểu tượng app SongHanzi thu nhỏ (khối màu chính với chữ 歌). */
function AppIcon({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.24} className="fill-primary" />
      <text x={x + size / 2} y={y + size * 0.68} textAnchor="middle" className="fill-on-primary font-serif" style={{ fontSize: size * 0.55 }}>歌</text>
    </g>
  );
}

/** Nội dung trang web giả (biểu tượng + hai dòng) để nền không trống. */
function PageBody({ top }: { top: number }) {
  return (
    <g>
      <AppIcon x={112} y={top} size={36} />
      <rect x="86" y={top + 46} width="88" height="7" rx="3.5" className="fill-surface-container-high" />
      <rect x="98" y={top + 60} width="64" height="7" rx="3.5" className="fill-surface-container-high" />
    </g>
  );
}

/** Nút Chia sẻ của Safari: ô vuông mở miệng có mũi tên hướng lên. */
function ShareGlyph({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="M-5 -1 h-2.5 v10 h15 v-10 h-2.5 M0 -8 v12 M-3.8 -4.2 l3.8 -3.8 l3.8 3.8" fill="none" className="stroke-on-surface" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />;
}

export function IosStep1Art() {
  return (
    <Art>
      <PageBody top={22} />
      <rect x="64" y="100" width="132" height="12" rx="6" className="fill-surface-container-high" />
      <text x="130" y="109" textAnchor="middle" className={TEXT}>songhanzi.com</text>
      <line x1="52" y1="118" x2="208" y2="118" className="stroke-outline-variant" />
      <path d="M79 126 l-5 6 l5 6" fill="none" className="stroke-on-surface-variant" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M102 126 l5 6 l-5 6" fill="none" className="stroke-on-surface-variant" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="132" cy="132" r="15" className={HI} strokeWidth="2" />
      <ShareGlyph x={132} y={132} />
      <rect x="156" y="125" width="14" height="14" rx="2" fill="none" className="stroke-on-surface-variant" strokeWidth="1.5" />
      <rect x="182" y="125" width="14" height="14" rx="2" fill="none" className="stroke-on-surface-variant" strokeWidth="1.5" />
    </Art>
  );
}

export function IosStep2Art() {
  return (
    <Art>
      <rect x="60" y="34" width="140" height="106" rx="12" className="fill-surface-container-low stroke-outline-variant" />
      <text x="72" y="52" className={TEXT}>Sao chép</text>
      <line x1="66" y1="60" x2="194" y2="60" className="stroke-outline-variant" />
      <text x="72" y="76" className={TEXT}>Thêm dấu trang</text>
      <rect x="64" y="84" width="132" height="24" rx="6" className={HI} strokeWidth="2" />
      <rect x="70" y="90" width="12" height="12" rx="2" fill="none" className="stroke-primary" strokeWidth="1.5" />
      <path d="M76 93 v6 M73 96 h6" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
      <text x="85" y="99" className="fill-primary text-[8.5px] font-semibold">Thêm vào Màn hình chính</text>
      <line x1="66" y1="116" x2="194" y2="116" className="stroke-outline-variant" />
      <text x="72" y="130" className={TEXT}>Tìm trong trang</text>
    </Art>
  );
}

export function IosStep3Art() {
  return (
    <Art>
      <rect x="60" y="22" width="140" height="106" rx="12" className="fill-surface-container-low stroke-outline-variant" />
      <text x="66" y="42" className={TEXT}>Hủy</text>
      <text x="124" y="42" textAnchor="middle" className="fill-on-surface text-[8px] font-semibold">Màn hình chính</text>
      <rect x="162" y="30" width="34" height="16" rx="8" className={HI} strokeWidth="2" />
      <text x="179" y="41" textAnchor="middle" className="fill-primary text-[9px] font-semibold">Thêm</text>
      <line x1="60" y1="52" x2="200" y2="52" className="stroke-outline-variant" />
      <AppIcon x={70} y={62} size={34} />
      <rect x="108" y="64" width="84" height="16" rx="5" className="fill-surface-container-lowest stroke-outline-variant" />
      <text x="114" y="75" className="fill-on-surface text-[9px]">SongHanzi</text>
      <text x="108" y="96" className={TEXT}>songhanzi.com</text>
    </Art>
  );
}

export function AndroidStep1Art() {
  return (
    <Art>
      <rect x="52" y="6" width="156" height="26" rx="16" className="fill-surface-container-low" />
      <rect x="62" y="12" width="104" height="14" rx="7" className="fill-surface-container-high" />
      <text x="114" y="22" textAnchor="middle" className={TEXT}>songhanzi.com</text>
      <circle cx="190" cy="19" r="12" className={HI} strokeWidth="2" />
      {[14, 19, 24].map((y) => <circle key={y} cx="190" cy={y} r="1.8" className="fill-on-surface" />)}
      <PageBody top={52} />
    </Art>
  );
}

export function AndroidStep2Art() {
  return (
    <Art>
      <rect x="52" y="6" width="156" height="26" rx="16" className="fill-surface-container-low" />
      <rect x="96" y="30" width="108" height="110" rx="8" className="fill-surface-container-low stroke-outline-variant" />
      <text x="106" y="48" className={TEXT}>Thẻ mới</text>
      <text x="106" y="66" className={TEXT}>Lịch sử</text>
      <rect x="100" y="76" width="100" height="22" rx="5" className={HI} strokeWidth="2" />
      <text x="106" y="91" className="fill-primary text-[9px] font-semibold">Cài đặt ứng dụng</text>
      <text x="106" y="116" className={TEXT}>Chia sẻ...</text>
      <text x="106" y="132" className={TEXT}>Cài đặt</text>
    </Art>
  );
}

export function AndroidStep3Art() {
  return (
    <Art>
      <rect x="62" y="30" width="136" height="88" rx="14" className="fill-surface-container-low stroke-outline-variant" />
      <text x="72" y="50" className="fill-on-surface text-[9px] font-semibold">Cài đặt ứng dụng?</text>
      <AppIcon x={72} y={60} size={26} />
      <text x="106" y="72" className="fill-on-surface text-[9px]">SongHanzi</text>
      <text x="106" y="84" className={TEXT}>songhanzi.com</text>
      <text x="124" y="108" className={TEXT}>Hủy</text>
      <rect x="148" y="96" width="42" height="16" rx="8" className={HI} strokeWidth="2" />
      <text x="169" y="107" textAnchor="middle" className="fill-primary text-[9px] font-semibold">Cài đặt</text>
    </Art>
  );
}
