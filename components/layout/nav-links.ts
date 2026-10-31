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
  { href: "/courses", label: "Học", icon: "school", matches: ["/grammar", "/radicals"] },
  { href: "/library", label: "Nghe", icon: "headphones", matches: ["/library", "/video", "/dialogues", "/learn", "/watch"] },
  { href: "/review", label: "Ôn & Nói", icon: "style", matches: ["/review", "/phat-am"] },
  { href: "/explore", label: "Khám phá", icon: "search" },
  { href: "/room", label: "Thi đấu", icon: "emoji_events", matches: ["/room", "/challenge", "/chat"] },
];

/** Lối vào phụ: hiện ở thanh bên (desktop) và trong bảng Menu (điện thoại, máy tính bảng). */
export const SECONDARY_LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/grammar", label: "Ngữ pháp", icon: "list_alt" },
  { href: "/radicals", label: "Bộ thủ", icon: "translate" },
  { href: "/report", label: "Báo cáo tuần", icon: "leaderboard" },
  { href: "/dictionary", label: "Tra từ", icon: "dictionary" },
  { href: "/profile", label: "Hồ sơ và huy hiệu", icon: "emoji_events" },
  { href: "/tools", label: "Công cụ", icon: "build" },
  { href: "/feedback", label: "Góp ý cho SongHanzi", icon: "feedback" },
  { href: "/settings", label: "Cài đặt và tài khoản", icon: "person" },
];

type SideLink = (typeof SECONDARY_LINKS)[number];
const pick = (...hrefs: string[]): SideLink[] => hrefs.map((h) => SECONDARY_LINKS.find((l) => l.href === h)!);

/**
 * Lối vào phụ ở thanh bên máy tính, gom thành nhóm có tiêu đề cho dễ quét: một nhóm "Học thêm" (Ngữ pháp, Bộ thủ, Tra từ, Công cụ); không lập nhóm chỉ có một mục. Hồ sơ, Báo cáo tuần, Cài đặt và Góp ý nằm ở menu avatar trên thanh đầu
 * (`ACCOUNT_LINKS`), không lặp lại ở đây. Điện thoại và máy tính bảng vẫn dùng danh sách phẳng `SECONDARY_LINKS` trong bảng Menu.
 */
export const SIDE_GROUPS: { id: string; title: string; links: SideLink[] }[] = [
  { id: "learn", title: "Học thêm", links: pick("/grammar", "/radicals", "/dictionary", "/tools") },
];

/** Mục cá nhân và tài khoản ở menu avatar (thanh đầu, màn lg trở lên). */
export const ACCOUNT_LINKS: SideLink[] = pick("/profile", "/report", "/settings", "/feedback");

const within = (prefix: string, pathname: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Mục điều hướng đang được chọn: đúng đường dẫn chính hoặc trang con, hoặc một trong các tiền tố `matches`. Nhận cả chuỗi đường dẫn (kiểm tra một mục đơn). */
export function isNavActive(target: string | NavLink, pathname: string): boolean {
  const link = typeof target === "string" ? { href: target } : target;
  return [link.href, ...(("matches" in link && link.matches) || [])].some((p) => within(p, pathname));
}
