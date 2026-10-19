"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo-mark";
import { DueBadge } from "@/components/review/due-badge";
import { Icon } from "@/components/ui/icon";
import { isNavActive, NAV_LINKS, SECONDARY_LINKS } from "./nav-links";

const ACTIVE = "border-ink bg-primary-container text-on-primary-container shadow-[0_3px_0_var(--shadow-ink)]";
const IDLE = "border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

/**
 * Thanh bên trái (từ md): máy tính bảng là thanh icon hẹp (icon + nhãn nhỏ), máy tính (lg) đầy đủ chữ kèm các lối vào phụ. Mục đang chọn có viền mực và đáy nổi theo phong cách game.
 * Điện thoại không có thanh này (dùng tab bar dưới).
 */
export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r-2 border-outline-variant bg-surface-container-low md:flex lg:w-64">
      <Link href="/app" aria-label="SongHanzi, về Hôm nay" className="flex h-16 shrink-0 items-center justify-center gap-2 lg:justify-start lg:px-5">
        <LogoMark size={36} />
        <span className="hidden text-headline-md font-extrabold tracking-tight text-on-surface lg:inline">Song<span className="text-primary">Hanzi</span></span>
      </Link>
      <nav aria-label="Điều hướng chính" className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2 lg:px-3">
        {NAV_LINKS.map((link) => {
          const active = isNavActive(link, pathname);
          return (
            <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-2 text-label-sm transition-colors lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-label-md ${active ? ACTIVE : IDLE}`}>
              <span className="relative"><Icon name={link.icon} filled={active} size={24} />{link.href === "/review" && <span className="lg:hidden"><DueBadge floating /></span>}</span>
              <span className="whitespace-nowrap font-bold">{link.label}</span>
              {link.href === "/review" && <span className="hidden lg:inline"><DueBadge /></span>}
            </Link>
          );
        })}
      </nav>
      <nav aria-label="Lối vào phụ" className="hidden shrink-0 border-t-2 border-outline-variant px-3 py-2 lg:block">
        {SECONDARY_LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={isNavActive(link.href, pathname) ? "page" : undefined}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface aria-[current=page]:font-bold aria-[current=page]:text-on-surface">
            <Icon name={link.icon} size={20} />{link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
