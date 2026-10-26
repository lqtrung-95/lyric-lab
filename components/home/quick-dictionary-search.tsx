import { Icon } from "@/components/ui/icon";

/** Ô tra từ nhanh ở trang chủ: gửi thẳng sang trang Tra từ (form GET, không cần JavaScript). */
export function QuickDictionarySearch() {
  return (
    <form action="/dictionary" method="get" role="search" aria-label="Tra từ nhanh" className="mt-space-sm flex items-center gap-2 rounded-xl border-2 border-ink bg-surface-container-lowest px-space-sm">
      <Icon name="dictionary" size={22} className="text-on-surface-variant" />
      <input name="q" type="search" required maxLength={80} autoComplete="off" aria-label="Tra từ: chữ Hán, pinyin, Hán Việt hoặc nghĩa" placeholder="Tra từ: chữ Hán, pinyin, Hán Việt, nghĩa…" className="min-h-12 min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant" />
      <button type="submit" className="min-h-11 px-2 text-label-md font-extrabold text-primary hover:underline">Tra</button>
    </form>
  );
}
