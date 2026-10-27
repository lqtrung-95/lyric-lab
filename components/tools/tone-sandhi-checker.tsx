"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { MAX_CONVERT_CHARS, type ConvertedLine } from "@/lib/tools/han-converter-shared";
import { applySandhi, charsFromConverted, SANDHI_RULE_TEXT, type SandhiRule, type SandhiSyllable } from "@/lib/tools/tone-sandhi";

const ERRORS: Record<string, string> = {
  no_han: "Hãy nhập ít nhất một chữ Hán.",
  rate_limited: "Bạn kiểm tra hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};
const QUICK = ["你好", "我很好", "不是", "一个人", "一天", "看一看", "第一"];

/** Gõ một cụm từ để xem chỗ nào đổi thanh khi nói (gọi `/api/tools/han-to-pinyin` lấy pinyin, quy tắc biến điệu chạy ngay ở trình duyệt). */
export function ToneSandhiChecker() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<{ source: string; syllables: SandhiSyllable[] }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(value = text) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/han-to-pinyin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: value }) });
      const body = (await res.json().catch(() => ({}))) as { lines?: ConvertedLine[]; error?: string };
      if (!res.ok || !body.lines) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa kiểm tra được, thử lại sau nhé.");
      setRows(charsFromConverted(body.lines).map((chars) => ({ source: chars.map((c) => c.ch).join(""), syllables: applySandhi(chars) })));
    } catch (e) {
      setRows(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const rules = rows ? ([...new Set(rows.flatMap((r) => r.syllables.map((s) => s.rule).filter((x): x is SandhiRule => !!x)))]) : [];
  return (
    <div className="space-y-space-md">
      <form onSubmit={(e) => { e.preventDefault(); void check(); }} className="space-y-3">
        <label htmlFor="sandhi-input" className="block text-label-md font-medium text-on-surface">Nhập từ hoặc câu tiếng Trung</label>
        <div className="flex flex-wrap gap-3">
          <input id="sandhi-input" lang="zh" value={text} maxLength={MAX_CONVERT_CHARS} onChange={(e) => setText(e.target.value)} placeholder="Ví dụ: 你好"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-5 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none" />
          <button type="submit" disabled={busy || !text.trim()} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang kiểm tra…" : "Kiểm tra"}</button>
        </div>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label-md text-on-surface-variant">Thử nhanh:</span>
        {QUICK.map((q) => <button key={q} type="button" lang="zh" onClick={() => { setText(q); void check(q); }} className="min-h-11 rounded-full border border-outline-variant px-4 font-serif text-body-md text-on-surface hover:bg-surface-container-high">{q}</button>)}
      </div>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {rows && (
        <section aria-label="Kết quả" className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-space-md">
              <div lang="zh" className="flex flex-wrap items-end gap-x-1 gap-y-3">
                {r.syllables.map((s, j) => (
                  <span key={j} className="inline-flex flex-col items-center">
                    <span className="font-serif text-headline-md">{s.ch}</span>
                    {s.spoken && (
                      <span className={`rounded px-1 text-label-md ${s.rule ? "bg-secondary-container font-extrabold text-on-secondary-container" : "text-primary"}`}>
                        {s.spoken}
                        {s.rule && s.py && <span className="ml-1 text-label-sm font-normal opacity-70">({s.py})</span>}
                      </span>
                    )}
                  </span>
                ))}
                <PronounceButton text={r.source} className="size-10 self-center" />
              </div>
            </div>
          ))}
          {rules.length === 0 ? (
            <p role="status" className="text-body-md text-on-surface-variant">Cụm này không có chỗ nào đổi thanh: đọc đúng như pinyin gốc.</p>
          ) : (
            <ul className="space-y-1" aria-label="Quy tắc đã áp dụng">
              {rules.map((rule) => <li key={rule} className="rounded-xl bg-secondary-container p-3 text-label-md text-on-secondary-container">{SANDHI_RULE_TEXT[rule]}</li>)}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
