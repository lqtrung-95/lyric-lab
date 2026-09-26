"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { href: "/review", label: "Ôn thẻ" },
  { href: "/review/pinyin", label: "Gõ pinyin" },
  { href: "/review/cloze", label: "Điền lời" },
  { href: "/review/match", label: "Ghép cặp" },
  { href: "/review/listen", label: "Nghe và chọn" },
];

/** Thanh chuyển chế độ ôn tập: ôn thẻ chuẩn (theo lịch FSRS) và ba chế độ luyện dạng game. */
export function ModeTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Chế độ ôn tập" className="mx-auto mb-space-md flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-surface-container-low p-1">
      {MODES.map((m) => {
        const active = pathname === m.href;
        return (
          <Link key={m.href} href={m.href} aria-current={active ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-full px-4 text-label-md transition-colors ${active ? "bg-surface-container-high font-semibold text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}
