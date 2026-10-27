"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { PinyinHanResult } from "@/lib/tools/pinyin-to-han";

const ERRORS: Record<string, string> = {
  invalid_pinyin: "Hãy gõ pinyin (chữ cái a–z, có thể kèm dấu thanh hoặc số 1–5), ví dụ nihao hoặc ni3 hao3.",
  rate_limited: "Bạn tra hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};
const QUICK = ["nihao", "xuesheng", "ni3 hao3", "xi huan", "zhongguo", "shi4", "lv"];

/** Gõ pinyin (có hoặc không dấu thanh) để tìm chữ Hán bạn muốn (gọi `/api/tools/pinyin-to-han`), kèm âm Hán Việt và nghĩa. */
export function PinyinToHanFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PinyinHanResult[] | null>(null);
  const [relaxed, setRelaxed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function find(value = query) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/pinyin-to-han", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: value }) });
      const body = (await res.json().catch(() => ({}))) as { results?: PinyinHanResult[]; relaxed?: boolean; error?: string };
      if (!res.ok || !body.results) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa tra được, thử lại sau nhé.");
      setResults(body.results);
      setRelaxed(body.relaxed === true);
    } catch (e) {
      setResults(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-space-md">
      <form onSubmit={(e) => { e.preventDefault(); void find(); }} className="space-y-3">
        <label htmlFor="pinyin-input" className="block text-label-md font-medium text-on-surface">Gõ pinyin (có hoặc không dấu thanh)</label>
        <div className="flex flex-wrap gap-3">
          <input id="pinyin-input" value={query} maxLength={40} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: nihao, xue sheng, ni3 hao3"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-5 text-body-lg text-on-surface focus:border-primary focus:outline-none" />
          <button type="submit" disabled={busy || !query.trim()} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang tìm…" : "Tìm chữ Hán"}</button>
        </div>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label-md text-on-surface-variant">Thử nhanh:</span>
        {QUICK.map((q) => <button key={q} type="button" onClick={() => { setQuery(q); void find(q); }} className="min-h-11 rounded-full border border-outline-variant px-4 text-body-md text-on-surface hover:bg-surface-container-high">{q}</button>)}
      </div>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {results && results.length === 0 && <p role="status" className="rounded-xl bg-surface-container p-4 text-body-md text-on-surface-variant">Chưa tìm thấy từ nào đọc như vậy. Thử viết lại pinyin, bỏ bớt âm tiết hoặc bỏ dấu thanh.</p>}
      {results && results.length > 0 && (
        <section aria-label="Kết quả" className="space-y-3">
          {relaxed && <p role="status" className="rounded-xl bg-surface-container p-3 text-body-md text-on-surface-variant">Không có từ nào đúng thanh bạn gõ, nên đang hiện các từ cùng âm (khác thanh).</p>}
          <ul className="grid gap-gutter sm:grid-cols-2">
            {results.map((r) => (
              <li key={`${r.han}-${r.pinyin}`} className="card-ink p-space-sm">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span lang="zh" className="font-serif text-headline-md">{r.han}</span>
                  {r.traditional !== r.han && <span lang="zh-Hant" className="font-serif text-body-lg text-on-surface-variant">({r.traditional})</span>}
                  <span className="text-body-md text-primary">{r.pinyin}</span>
                  <PronounceButton text={r.han} className="size-9" />
                  {r.hskLevel && <span className="rounded-full bg-secondary-container px-2 py-0.5 text-label-sm text-on-secondary-container">HSK {r.hskLevel}</span>}
                </p>
                {r.sinoViet && <p className="mt-1 text-body-md text-on-surface">Hán Việt: <span className="font-medium">{r.sinoViet}</span></p>}
                {r.gloss && <p className="text-body-md text-on-surface">{r.gloss}</p>}
                {r.meaning && <p className="text-body-sm text-on-surface-variant">{r.meaning}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
