"use client";

import Link from "next/link";
import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { splitByTerm, type ExampleItem } from "@/lib/tools/example-sentences";

interface Result { term: string; pinyin: string | null; meaning: string | null; sentences: ExampleItem[] }

const ERRORS: Record<string, string> = {
  no_han: "Hãy nhập một từ tiếng Trung bằng chữ Hán, ví dụ 喜欢.",
  rate_limited: "Bạn tra hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};
const QUICK = ["喜欢", "因为", "觉得", "已经", "朋友", "工作", "可是", "知道"];

/** Tìm câu ví dụ thật có từ bạn nhập (gọi `/api/tools/example-sentences`): câu từ video đã duyệt kèm pinyin, nghĩa tiếng Việt, nghe và mở video đúng chỗ. */
export function ExampleSentenceFinder() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function find(value = query) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/example-sentences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: value }) });
      const body = (await res.json().catch(() => ({}))) as Partial<Result> & { error?: string };
      if (!res.ok || !body.term || !body.sentences) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa tìm được, thử lại sau nhé.");
      setResult({ term: body.term, pinyin: body.pinyin ?? null, meaning: body.meaning ?? null, sentences: body.sentences });
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-space-md">
      <form onSubmit={(e) => { e.preventDefault(); void find(); }} className="space-y-3">
        <label htmlFor="example-input" className="block text-label-md font-medium text-on-surface">Nhập một từ tiếng Trung (chữ Hán)</label>
        <div className="flex flex-wrap gap-3">
          <input id="example-input" lang="zh" value={query} maxLength={12} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: 喜欢"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-5 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none" />
          <button type="submit" disabled={busy || !query.trim()} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang tìm…" : "Tìm câu ví dụ"}</button>
        </div>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label-md text-on-surface-variant">Thử nhanh:</span>
        {QUICK.map((q) => <button key={q} type="button" lang="zh" onClick={() => { setQuery(q); void find(q); }} className="min-h-11 rounded-full border border-outline-variant px-4 font-serif text-body-md text-on-surface hover:bg-surface-container-high">{q}</button>)}
      </div>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {result && (
        <section aria-label="Kết quả" className="space-y-space-sm">
          <p className="flex flex-wrap items-baseline gap-x-2"><span lang="zh" className="font-serif text-headline-md">{result.term}</span>{result.pinyin && <span className="text-body-md text-primary">{result.pinyin}</span>}{result.meaning && <span className="text-body-md text-on-surface-variant">{result.meaning}</span>}</p>
          {result.sentences.length === 0 ? (
            <p role="status" className="rounded-xl bg-surface-container p-4 text-body-md text-on-surface-variant">Chưa có câu ví dụ nào cho từ này. Hiện có câu cho nhiều từ HSK thông dụng; thử từ khác hoặc xem phần Tra từ.</p>
          ) : (
            <ul className="space-y-3">
              {result.sentences.map((s) => (
                <li key={s.watchPath} className="card-ink flex items-start gap-3 p-space-sm">
                  <div className="min-w-0 flex-1">
                    <p lang="zh" className="font-serif text-headline-md leading-snug">{splitByTerm(s.text, result.term).map((p, i) => p.hit ? <mark key={i} className="rounded bg-primary-container px-0.5 text-on-primary-container">{p.text}</mark> : <span key={i}>{p.text}</span>)}</p>
                    <p className="text-body-md text-primary">{s.pinyin}</p>
                    <p className="text-body-md text-on-surface">{s.translation}</p>
                    <Link href={s.watchPath} className="mt-1 inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">Nghe trong video gốc →</Link>
                  </div>
                  <PronounceButton text={s.text} className="size-10" />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
