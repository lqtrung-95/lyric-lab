import type { IconName } from "@/components/ui/icon-names";

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
  /** Tiền tố đường dẫn khác cũng tính là đang ở mục này (ví dụ mục "Nghe" gồm cả thư viện, video và màn nghe). */
  matches?: string[];
}

// Sáu mục điều hướng chính: bốn mục theo vòng học (PRD v2 mục 5.3: Hôm nay · Học · Nghe · Ôn & Nói) và hai mục chơi tách riêng (Khám phá: chơi một mình qua cảnh và vụ án; Thi đấu: chơi với bạn). Đường dẫn cũ giữ nguyên, chỉ đổi cách gom.
export const NAV_LINKS: NavLink[] = [
  { href: "/app", label: "Hôm nay", icon: "home" },
  { href: "/courses", label: "Học", icon: "school" },
  { href: "/library", label: "Nghe", icon: "headphones", matches: ["/library", "/video", "/learn", "/watch"] },
  { href: "/review", label: "Ôn & Nói", icon: "style", matches: ["/review", "/phat-am"] },
  { href: "/explore", label: "Khám phá", icon: "search" },
  { href: "/room", label: "Thi đấu", icon: "emoji_events", matches: ["/room", "/challenge", "/chat"] },
];

/** Lối vào phụ: hiện ở thanh bên (desktop) và trong bảng Menu (điện thoại, máy tính bảng). */
export const SECONDARY_LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/dictionary", label: "Tra từ", icon: "dictionary" },
  { href: "/profile", label: "Hồ sơ và huy hiệu", icon: "emoji_events" },
  { href: "/cong-cu", label: "Công cụ", icon: "build" },
  { href: "/feedback", label: "Góp ý cho SongHanzi", icon: "feedback" },
  { href: "/settings", label: "Cài đặt và tài khoản", icon: "person" },
];

const within = (prefix: string, pathname: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Mục điều hướng đang được chọn: đúng đường dẫn chính hoặc trang con, hoặc một trong các tiền tố `matches`. Nhận cả chuỗi đường dẫn (kiểm tra một mục đơn). */
export function isNavActive(target: string | NavLink, pathname: string): boolean {
  const link = typeof target === "string" ? { href: target } : target;
  return [link.href, ...(("matches" in link && link.matches) || [])].some((p) => within(p, pathname));
}
