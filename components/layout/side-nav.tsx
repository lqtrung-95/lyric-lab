"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo-mark";
import { DueBadge } from "@/components/review/due-badge";
import { Icon } from "@/components/ui/icon";
import { isNavActive, NAV_LINKS, SIDE_GROUPS } from "./nav-links";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";

const ACTIVE = "border-ink bg-primary-container text-on-primary-container shadow-[0_3px_0_var(--shadow-ink)]";
const IDLE = "border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

function SideLinks({ links, pathname }: { links: (typeof SIDE_GROUPS)[number]["links"]; pathname: string }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} aria-current={isNavActive(link.href, pathname) ? "page" : undefined}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface aria-[current=page]:font-bold aria-[current=page]:text-on-surface">
            <Icon name={link.icon} size={20} />{link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Thanh bên trái (từ md): máy tính bảng là thanh icon hẹp (icon + nhãn nhỏ), máy tính (lg) đầy đủ chữ kèm các lối vào phụ, và có nút "Thu gọn" để về thanh icon cho nội dung rộng hơn
 * (lối vào phụ khi đó chỉ còn icon). Mục đang chọn có viền mực và đáy nổi theo phong cách game. Điện thoại không có thanh này (dùng tab bar dưới).
 */
export function SideNav() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();
  const wide = !collapsed; // từ lg: đầy đủ chữ khi mở rộng
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r-2 border-outline-variant bg-surface-container-low md:flex ${wide ? "lg:w-64" : ""}`}>
      <div className={`flex shrink-0 items-center ${wide ? "lg:justify-between lg:pr-2" : ""}`}>
        <Link href="/app" aria-label="SongHanzi, về Hôm nay" className={`flex h-16 min-w-0 flex-1 items-center justify-center gap-2 ${wide ? "lg:justify-start lg:px-5" : ""}`}>
          <LogoMark size={36} />
          <span className={`hidden text-headline-md font-extrabold tracking-tight text-on-surface ${wide ? "lg:inline" : ""}`}>Song<span className="text-primary">Hanzi</span></span>
        </Link>
        {wide && (
          <button type="button" onClick={toggle} aria-expanded={wide} aria-label="Thu gọn thanh bên" title="Thu gọn thanh bên" className="hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface lg:flex">
            <Icon name="chevron_left" size={22} />
          </button>
        )}
      </div>
      {collapsed && (
        <button type="button" onClick={toggle} aria-expanded={false} aria-label="Mở rộng thanh bên" title="Mở rộng thanh bên" className="mx-auto mb-1 hidden size-11 cursor-pointer items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface lg:flex">
          <Icon name="chevron_right" size={22} />
        </button>
      )}
      <nav aria-label="Điều hướng chính" className={`flex-1 space-y-1.5 overflow-y-auto px-2 py-2 ${wide ? "lg:px-3" : ""}`}>
        {NAV_LINKS.map((link) => {
          const active = isNavActive(link, pathname);
          return (
            <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-2 text-label-sm transition-colors ${wide ? "lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-label-md" : ""} ${active ? ACTIVE : IDLE}`}>
              <span className="relative"><Icon name={link.icon} filled={active} size={24} />{link.href === "/review" && <span className={wide ? "lg:hidden" : ""}><DueBadge floating /></span>}</span>
              <span className="whitespace-nowrap font-bold">{link.label}</span>
              {link.href === "/review" && wide && <span className="hidden lg:inline"><DueBadge /></span>}
            </Link>
          );
        })}
      </nav>
      <nav aria-label="Lối vào phụ" className={`hidden shrink-0 border-t-2 border-outline-variant px-3 py-2 ${collapsed ? "lg:flex lg:flex-col lg:items-center lg:gap-1" : "lg:block"}`}>
        {collapsed ? (
          SIDE_GROUPS.flatMap((g) => g.links).map((link) => (
            <Link key={link.href} href={link.href} aria-label={link.label} title={link.label} aria-current={isNavActive(link.href, pathname) ? "page" : undefined}
              className="flex min-h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface aria-[current=page]:text-on-surface">
              <Icon name={link.icon} size={20} />
            </Link>
          ))
        ) : (
          SIDE_GROUPS.map((g) => (
            <div key={g.id} className="mt-1 first:mt-0">
              <p className="flex min-h-9 items-center px-3 text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">{g.title}</p>
              <SideLinks links={g.links} pathname={pathname} />
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
