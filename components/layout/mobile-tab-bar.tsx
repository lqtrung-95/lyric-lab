"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { NAV_LINKS, isNavActive } from "./nav-links";

/** Tab bar dưới cùng cho mobile (ẩn từ md trở lên). */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-50 bg-surface/90 pb-safe shadow-[0_-2px_12px_rgba(30,26,22,0.04)] backdrop-blur-xl md:hidden"
    >
      <div className="flex h-16 items-center justify-around px-space-sm">
        {NAV_LINKS.map((link) => {
          const active = isNavActive(link.href, pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-12 min-w-20 flex-col items-center justify-center transition-colors ${
                active ? "font-medium text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon name={link.icon} filled={active} size={24} />
              <span className="mt-0.5 text-label-sm">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
