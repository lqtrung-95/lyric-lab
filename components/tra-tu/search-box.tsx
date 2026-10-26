"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { pushHistory, readHistory, saveHistory } from "@/lib/tra-tu/search-history";
import { useWordSuggestions } from "./use-word-suggestions";
import { WordResultRow, wordHref } from "./word-result-row";

/**
 * Ô tìm từ với gợi ý khi gõ (combobox): ↑/↓ chọn gợi ý, Enter mở từ đang chọn (hoặc xem mọi kết quả), Esc đóng.
 * Gõ chữ Hán, pinyin (có/không dấu), âm Hán Việt, nghĩa tiếng Anh hoặc tiếng Việt.
 */
export function SearchBox({ initialQuery = "", autoFocus = false }: { initialQuery?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { items, loading } = useWordSuggestions(value);
  // Chuyển trang (kết quả tra/trang từ) mất một lúc ở server: giữ nút ở trạng thái "Đang tra…" cho tới khi trang mới hiện.
  const [pending, startTransition] = useTransition();

  const remember = (term: string) => saveHistory(pushHistory(readHistory(), term));
  function submit() {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    const picked = active >= 0 ? items[active] : undefined;
    if (picked) { remember(picked.simplified); startTransition(() => router.push(wordHref(picked.simplified))); return; }
    remember(q);
    startTransition(() => router.push(`/dictionary?q=${encodeURIComponent(q)}`));
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" && items.length) { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % items.length); }
    else if (e.key === "ArrowUp" && items.length) { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    else if (e.key === "Escape") { setOpen(false); setActive(-1); }
  }
  const typed = open && value.trim().length > 0;
  const showList = typed && items.length > 0;
  const showSearching = typed && items.length === 0 && loading;

  return (
    <form role="search" aria-busy={pending || loading} onSubmit={(e) => { e.preventDefault(); submit(); }} className="relative">
      <div className="card-ink flex items-center gap-2 bg-surface-container-lowest px-space-sm">
        <Icon name="search" size={24} className="text-on-surface-variant" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Tra từ: chữ Hán, pinyin, Hán Việt hoặc nghĩa"
          placeholder="Chữ Hán, pinyin, Hán Việt, nghĩa…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="min-h-14 min-w-0 flex-1 bg-transparent text-body-lg outline-none placeholder:text-on-surface-variant"
        />
        {loading && !pending && <Spinner size={18} className="text-on-surface-variant" />}
        <button type="submit" disabled={pending} className="btn-3d btn-3d-primary min-h-11 min-w-16 px-4 text-label-md font-extrabold disabled:opacity-80">
          {pending ? <span className="inline-flex items-center gap-1.5"><Spinner size={16} />Đang tra…</span> : "Tra"}
        </button>
      </div>
      {showSearching && (
        <p className="card-ink absolute inset-x-0 top-full z-20 mt-2 flex items-center gap-2 bg-surface-container-lowest px-space-sm py-3 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tìm…</p>
      )}
      {showList && (
        <ul id={listId} role="listbox" aria-label="Gợi ý từ" className={`card-ink absolute inset-x-0 top-full z-20 mt-2 max-h-[60vh] overflow-y-auto bg-surface-container-lowest p-1 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {items.map((w, i) => (
            <li key={`${w.simplified}|${w.traditional}`} id={`${listId}-${i}`} role="option" aria-selected={i === active} className={i === active ? "rounded-xl bg-surface-container" : ""}>
              <WordResultRow word={w} compact onPick={() => remember(w.simplified)} />
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="sr-only">{pending ? "Đang tra…" : loading ? "Đang tìm…" : value.trim() ? `${items.length} gợi ý` : ""}</p>
    </form>
  );
}
