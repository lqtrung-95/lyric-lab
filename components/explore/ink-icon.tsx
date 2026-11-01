import type { ReactElement } from "react";

export type InkIconName = "ghost" | "case" | "solved" | "pin" | "home" | "food" | "shopping" | "services" | "culture" | "tech" | "travel" | "fun";

const INK = "#2b2118";
const S = { stroke: INK, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * Biểu tượng vẽ tay (SVG, nét mực + tô phẳng) cho các điểm nhấn của màn Khám phá: ma phai, ghim vụ án, khu phố. Thay emoji vì emoji do hệ điều hành
 * vẽ (Apple, Windows, Android đều khác nhau) còn đây giống nhau trên mọi máy và khớp phong cách viền mực. Trang trí: luôn `aria-hidden`, chữ nghĩa nằm ở nhãn cạnh bên.
 * Emoji của từng cảnh (SCENE_EMOJI) vẫn dùng font emoji Noto thống nhất (xem `emojiFontUrl`).
 */
const SHAPES: Record<InkIconName, ReactElement> = {
  ghost: <><path d="M6 28V14a10 10 0 0 1 20 0v14l-3.3-3-3.4 3-3.3-3-3.3 3-3.4-3z" fill="#fff" {...S} /><circle cx="12.5" cy="14" r="1.9" fill={INK} /><circle cx="19.5" cy="14" r="1.9" fill={INK} /><ellipse cx="16" cy="19" rx="2.2" ry="2.8" fill="#f08aa0" stroke={INK} strokeWidth="1.5" /></>,
  case: <><path d="M4 31c0-6.5 5-9.5 12-9.5s12 3 12 9.5z" fill="#9b7650" {...S} /><path d="m12 22 4 6 4-6z" fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" /><circle cx="16" cy="16" r="6.5" fill="#ffd9b0" {...S} /><circle cx="13.5" cy="16.5" r="1" fill={INK} /><circle cx="18.5" cy="16.5" r="1" fill={INK} /><path d="M14 19.4q2 1.4 4 0" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" /><path d="M9.5 11.5h13" stroke={INK} strokeWidth="2" strokeLinecap="round" /><ellipse cx="16" cy="11" rx="11" ry="2.6" fill="#5a4030" {...S} /><path d="M9.6 10.5C9.4 2.8 22.6 2.8 22.4 10.5z" fill="#6b4e38" {...S} /><path d="M9.8 8.6h12.4" stroke="#d9573f" strokeWidth="2" /><circle cx="24" cy="22.5" r="4.6" fill="#cfe9ff" {...S} strokeWidth="1.8" /><path d="m27.3 25.8 3 3.2" {...S} strokeWidth="3" /></>,
  solved: <><circle cx="16" cy="16" r="12" fill="#5fb04a" {...S} /><path d="m10 16.5 4.2 4.2L22.5 12" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></>,
  pin: <><path d="M16 29S6 19.5 6 12.5a10 10 0 0 1 20 0C26 19.5 16 29 16 29z" fill="#ef5f4a" {...S} /><circle cx="16" cy="12.5" r="3.6" fill="#fff" stroke={INK} strokeWidth="1.8" /></>,
  home: <><rect x="7" y="14" width="18" height="14" rx="1.5" fill="#fff3dc" {...S} /><path d="M3.5 15.5 16 4l12.5 11.5z" fill="#e08a3c" {...S} /><rect x="13" y="20" width="6" height="8" rx="1" fill="#a8693a" stroke={INK} strokeWidth="1.8" /></>,
  food: <><path d="M4 15h24a12 11 0 0 1-24 0z" fill="#fff" {...S} /><path d="M10 4l7 9M15 3l5 10" fill="none" {...S} /><path d="M7 19h18" fill="none" stroke="#e45f3f" strokeWidth="2.2" strokeLinecap="round" /></>,
  shopping: <><path d="M12 11V9a4 4 0 0 1 8 0v2" fill="none" {...S} /><path d="M6 11h20l-1.5 17h-17z" fill="#8bc34a" {...S} /><circle cx="12.5" cy="16" r="1.2" fill={INK} /><circle cx="19.5" cy="16" r="1.2" fill={INK} /></>,
  services: <><path d="M3.5 12 16 4l12.5 8z" fill="#3f86c4" {...S} /><path d="M7 14v10M13 14v10M19 14v10M25 14v10" fill="none" {...S} strokeWidth="2.6" /><rect x="3.5" y="25" width="25" height="3.5" rx="1" fill="#d6e6f7" {...S} /></>,
  culture: <><path d="M2.5 12 16 5l13.5 7L16 19z" fill="#8062b8" {...S} /><path d="M8 16v6c3 3 13 3 16 0v-6" fill="#b9a2e8" {...S} /><path d="M29 13v8" fill="none" {...S} /></>,
  tech: <><rect x="6" y="7" width="20" height="14" rx="2" fill="#dfe3f7" {...S} /><path d="M3 25h26" fill="none" {...S} strokeWidth="3" /><path d="m12 12 3 2-3 2M17.5 16.5H21" fill="none" stroke="#4a5fc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  travel: <><rect x="6" y="4" width="20" height="21" rx="6" fill="#2f9a90" {...S} /><rect x="9.5" y="8" width="13" height="8" rx="2" fill="#d4ece8" stroke={INK} strokeWidth="1.8" /><circle cx="11.5" cy="20.5" r="1.4" fill="#fff" /><circle cx="20.5" cy="20.5" r="1.4" fill="#fff" /><path d="m9 29 3-4M23 29l-3-4" fill="none" {...S} /></>,
  fun: <><circle cx="16" cy="13" r="9" fill="#fff" {...S} /><path d="M16 4v18M7 13h18M9.6 6.6l12.8 12.8M22.4 6.6 9.6 19.4" fill="none" stroke={INK} strokeWidth="1.4" /><circle cx="16" cy="13" r="2" fill="#f4b740" stroke={INK} strokeWidth="1.5" /><path d="m10 29 6-16 6 16" fill="none" {...S} /></>,
};

export const INK_ICON_NAMES = Object.keys(SHAPES) as InkIconName[];

export function InkIcon({ name, size = 24, className }: { name: InkIconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" width={size} height={size} className={className}>{SHAPES[name]}</svg>;
}
