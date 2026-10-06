import type { IconName } from "@/components/ui/icon-names";

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
  /** Chỉ hiện ở môi trường phát triển cho tới khi mở công khai bằng `NEXT_PUBLIC_VIDEO_PUBLIC=1`. */
  previewOnly?: boolean;
}

// Các mục điều hướng chính (design-brief §3), thêm "Thi đấu" (phòng luyện tập 1v1) và "Video" (video luyện nghe).
export const NAV_LINKS: NavLink[] = [
  { href: "/app", label: "Trang chủ", icon: "home" },
  { href: "/room", label: "Thi đấu", icon: "group" },
  { href: "/video", label: "Video", icon: "smart_display", previewOnly: true },
  { href: "/review", label: "Ôn tập", icon: "style" },
  { href: "/library", label: "Thư viện", icon: "library_music" },
];

export function isNavActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
