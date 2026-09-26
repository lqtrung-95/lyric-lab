import type { IconName } from "@/components/ui/icon-names";

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

// Ba mục điều hướng chính (design-brief §3). Thư viện và Ôn tập hoàn thiện ở các mốc sau.
export const NAV_LINKS: NavLink[] = [
  { href: "/app", label: "Trang chủ", icon: "home" },
  { href: "/review", label: "Ôn tập", icon: "style" },
  { href: "/library", label: "Thư viện", icon: "library_music" },
];

export function isNavActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
