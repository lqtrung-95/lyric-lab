"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo-mark";
import { Icon } from "@/components/ui/icon";
import { DueBadge } from "@/components/review/due-badge";
import { NAV_LINKS, isNavActive } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/** Thanh trên cùng: desktop có 3 mục điều hướng dạng viên thuốc; mobile chỉ có logo (tab bar ở dưới). */
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 pt-safe shadow-[0_1px_8px_rgba(30,26,22,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-gutter md:px-6 lg:px-12">
        <div className="flex items-center gap-8">
          <Link href="/app" className="flex min-h-11 items-center gap-2 transition-opacity hover:opacity-90">
            <LogoMark size={32} />
            <span className="font-serif text-headline-md font-semibold tracking-tight text-on-surface">Lyric <span className="text-primary">Lab</span></span>
          </Link>
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 rounded-full bg-surface-container-low/70 p-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-full px-4 text-label-md transition-colors ${
                    active
                      ? "bg-surface-container-high font-medium text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {link.label}
                  {link.href === "/review" && <DueBadge />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/settings" aria-label="Cài đặt và tài khoản" className="flex h-11 w-11 items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Icon name="person" size={18} />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
