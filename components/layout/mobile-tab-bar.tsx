"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { DueBadge } from "@/components/review/due-badge";
import { isNavActive, NAV_LINKS } from "./nav-links";

/** Tab bar dưới cùng cho điện thoại (ẩn từ md): 6 mục (nhãn 11px, viên thuốc 44px để vừa màn 320px), mục đang chọn có viên thuốc nổi viền mực. */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng chính" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-outline-variant bg-surface/95 pb-safe backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-0.5">
        {NAV_LINKS.map((link) => {
          const active = isNavActive(link, pathname);
          return (
            <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
              className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 ${active ? "font-extrabold text-on-surface" : "text-on-surface-variant"}`}>
              <span className={`relative flex h-7 w-11 items-center justify-center rounded-full border-2 ${active ? "border-ink bg-primary-container text-on-primary-container shadow-[0_2px_0_var(--shadow-ink)]" : "border-transparent"}`}>
                <Icon name={link.icon} filled={active} size={22} />
                {link.href === "/review" && <DueBadge floating />}
              </span>
              <span className="max-w-full whitespace-nowrap text-[11px] font-semibold leading-none tracking-tight min-[400px]:text-label-sm">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
