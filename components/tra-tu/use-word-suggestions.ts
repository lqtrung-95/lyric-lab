"use client";

import { useEffect, useState } from "react";
import type { WordResult } from "@/lib/tra-tu/types";

const DEBOUNCE_MS = 180;

/** Gợi ý khi gõ: gọi API sau khi ngừng gõ một nhịp, bỏ kết quả của lần gõ cũ (tránh gợi ý nhảy lùi). */
export function useWordSuggestions(query: string, limit = 8): { items: WordResult[]; loading: boolean } {
  const q = query.trim();
  const [state, setState] = useState<{ q: string; items: WordResult[] }>({ q: "", items: [] });

  useEffect(() => {
    if (!q) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dictionary/search?q=${encodeURIComponent(q)}&limit=${limit}`, { signal: ctrl.signal });
        const data = res.ok ? ((await res.json()) as { results: WordResult[] }) : { results: [] };
        setState({ q, items: data.results });
      } catch { /* đổi truy vấn hoặc mất mạng: giữ gợi ý cũ */ }
    }, DEBOUNCE_MS);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q, limit]);

  return { items: q ? state.items : [], loading: !!q && state.q !== q };
}
