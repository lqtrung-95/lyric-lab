"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";

/** Ô tìm nhanh ở bên trái thanh đầu (từ md): gõ chữ Hán, pinyin hoặc nghĩa rồi Enter để sang trang Tra từ với kết quả. */
export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); const t = q.trim().slice(0, 80); if (t) { router.push(`/dictionary?q=${encodeURIComponent(t)}`); setQ(""); } }} className="relative hidden w-full max-w-sm md:block">
      <label>
        <span className="sr-only">Tra từ nhanh</span>
        <Icon name="search" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tra từ: chữ Hán, pinyin, nghĩa…" maxLength={80}
          className="min-h-11 w-full rounded-full border-2 border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-ink" />
      </label>
    </form>
  );
}
