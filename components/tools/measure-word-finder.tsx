"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { MeasureWordResult } from "@/lib/tools/find-measure-words";
import { MEASURE_WORD_GUIDE } from "@/lib/tools/measure-word-guide";

const ERRORS: Record<string, string> = {
  no_han: "Hãy nhập một danh từ bằng chữ Hán, ví dụ 书.",
  rate_limited: "Bạn tra hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};
const QUICK = ["书", "鱼", "桌子", "老师", "手机", "房子", "雨伞", "猫"];

/** Tra lượng từ của một danh từ (gọi `/api/tools/measure-words`) kèm bảng lượng từ thông dụng giải thích bằng tiếng Việt. */
export function MeasureWordFinder() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<MeasureWordResult | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guide = (text: string) => MEASURE_WORD_GUIDE.find((g) => g.word === text);

  async function find(value = query) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/measure-words", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: value }) });
      const body = (await res.json().catch(() => ({}))) as { result?: MeasureWordResult | null; error?: string };
      if (!res.ok || body.result === undefined) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa tra được, thử lại sau nhé.");
      setResult(body.result);
    } catch (e) {
      setResult(undefined);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-space-lg">
      <div className="space-y-space-md">
        <form onSubmit={(e) => { e.preventDefault(); void find(); }} className="space-y-3">
          <label htmlFor="measure-input" className="block text-label-md font-medium text-on-surface">Nhập danh từ (chữ Hán)</label>
          <div className="flex flex-wrap gap-3">
            <input id="measure-input" lang="zh" value={query} maxLength={20} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: 书"
              className="min-h-12 min-w-0 flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-5 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none" />
            <button type="submit" disabled={busy || !query.trim()} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang tra…" : "Tra lượng từ"}</button>
          </div>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-md text-on-surface-variant">Thử nhanh:</span>
          {QUICK.map((q) => <button key={q} type="button" lang="zh" onClick={() => { setQuery(q); void find(q); }} className="min-h-11 rounded-full border border-outline-variant px-4 font-serif text-body-md text-on-surface hover:bg-surface-container-high">{q}</button>)}
        </div>
        {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
        {result === null && <p role="status" className="rounded-xl bg-surface-container p-4 text-body-md text-on-surface-variant">Chưa tìm thấy từ này trong từ điển. Kiểm tra lại chữ Hán hoặc thử từ khác. Nếu không chắc, dùng 个 (gè) vẫn được hiểu.</p>}
        {result && (
          <section aria-label="Kết quả" className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-space-md">
            <p className="flex items-center gap-2"><span lang="zh" className="font-serif text-headline-md">{result.term}</span><span className="text-body-md text-primary">{result.pinyin}</span><PronounceButton text={result.term} className="size-10" /></p>
            {result.meaning && <p className="text-body-md text-on-surface-variant">{result.meaning}</p>}
            {result.classifiers.length === 0 ? (
              <p className="mt-3 text-body-md text-on-surface">Từ điển không ghi lượng từ riêng cho từ này. Thường dùng <span lang="zh" className="font-serif font-bold">个 (gè)</span>.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {result.classifiers.map((c) => {
                  const g = guide(c.text);
                  return (
                    <li key={c.text} className="rounded-xl bg-surface-container p-3">
                      <p className="flex items-center gap-2"><span lang="zh" className="font-serif text-headline-md">{c.text}</span><span className="text-body-md text-primary">{c.pinyin}</span>
                        <span lang="zh" className="ml-2 text-body-lg">一{c.text}{result.term}</span></p>
                      {g && <p className="mt-1 text-body-md text-on-surface-variant">{g.usage}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
      <section aria-labelledby="guide-heading">
        <h2 id="guide-heading" className="font-serif text-headline-md">15 lượng từ dùng nhiều nhất</h2>
        <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2">
          {MEASURE_WORD_GUIDE.map((g) => (
            <li key={g.word} className="card-ink p-space-sm">
              <p className="flex items-baseline gap-2"><span lang="zh" className="font-serif text-headline-md">{g.word}</span><span className="text-body-md text-primary">{g.pinyin}</span></p>
              <p className="mt-1 text-body-md text-on-surface-variant">{g.usage}</p>
              <ul className="mt-2 space-y-1">
                {g.examples.map((e) => <li key={e.zh} className="text-body-md"><span lang="zh" className="font-serif font-bold">{e.zh}</span> <span className="text-primary">{e.pinyin}</span> <span className="text-on-surface-variant">· {e.vi}</span></li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
