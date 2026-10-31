"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ACCOUNT_LINKS } from "./nav-links";

/** Nút avatar ở thanh đầu (từ lg) mở menu nhỏ: Hồ sơ và huy hiệu, Cài đặt và tài khoản, Góp ý. Đóng bằng Esc, bấm ra ngoài hoặc chọn một mục. */
export function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={root} className="relative hidden lg:block">
      <button type="button" aria-label="Tài khoản" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex h-11 w-11 cursor-pointer items-center justify-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-primary-container text-on-primary-container"><Icon name="person" size={20} /></span>
      </button>
      {open && (
        <ul role="menu" aria-label="Tài khoản" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border-2 border-ink bg-surface p-1 shadow-[0_6px_0_var(--shadow-ink)]">
          {ACCOUNT_LINKS.map((l) => (
            <li key={l.href} role="none">
              <Link href={l.href} role="menuitem" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md text-on-surface hover:bg-surface-container-high">
                <Icon name={l.icon} size={20} className="text-on-surface-variant" />{l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
