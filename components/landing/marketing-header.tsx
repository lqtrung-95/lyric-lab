import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const LINKS = [
  { href: "#how", label: "Cách hoạt động" },
  { href: "#features", label: "Tính năng" },
  { href: "#faq", label: "Hỏi đáp" },
];

/** Thanh trên của trang giới thiệu: neo tới các phần trong trang và nút vào app. */
export function MarketingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/85 pt-safe backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-gutter md:px-6 lg:px-12">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <LogoMark size={32} />
          <span className="font-serif text-headline-md font-semibold tracking-tight text-on-surface">Lyric <span className="text-primary">Lab</span></span>
        </Link>
        <nav aria-label="Các phần của trang" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="flex min-h-11 items-center rounded-full px-4 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/app" className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:bg-primary-container">Mở app</Link>
        </div>
      </div>
    </header>
  );
}
