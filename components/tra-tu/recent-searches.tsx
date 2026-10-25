"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { SEARCH_HISTORY_KEY, parseHistory, saveHistory } from "@/lib/tra-tu/search-history";

const subscribe = (cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); };
const snapshot = () => { try { return localStorage.getItem(SEARCH_HISTORY_KEY) ?? ""; } catch { return ""; } };

/** Các từ vừa tra (lưu cục bộ trên thiết bị). Mỗi mục mở lại đúng từ/truy vấn; có nút xóa lịch sử. */
export function RecentSearches() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const items = parseHistory(raw || null);
  if (items.length === 0) return null;
  return (
    <section aria-label="Tra gần đây" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1 text-headline-sm font-extrabold"><Icon name="history" size={22} /> Tra gần đây</h2>
        <button type="button" onClick={() => { saveHistory([]); window.dispatchEvent(new StorageEvent("storage")); }} className="min-h-11 px-2 text-label-md font-bold text-primary hover:underline">Xóa lịch sử</button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t}>
            <Link href={`/tra-tu?q=${encodeURIComponent(t)}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-body-md font-bold shadow-[0_3px_0_var(--shadow-ink)]">{t}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
