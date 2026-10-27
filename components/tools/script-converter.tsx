"use client";

import { useState } from "react";
import { MAX_SCRIPT_CHARS, SCRIPT_MODES, type ScriptMode, type ScriptResult } from "@/lib/tools/convert-script";

const ERRORS: Record<string, string> = {
  no_han: "Hãy nhập ít nhất một chữ Hán.",
  rate_limited: "Bạn chuyển hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};
const EXAMPLES: Record<ScriptMode, string> = { s2t: "我是学生,头发很长。", s2tw: "这个软件很好用。", s2hk: "我们去银行取钱。", t2s: "我是學生,學習漢語。" };

/** Công cụ chuyển giản thể ⇄ phồn thể (gọi `/api/tools/convert-script`), kèm danh sách chữ cần đọc lại vì có nhiều cách chuyển. */
export function ScriptConverter() {
  const [mode, setMode] = useState<ScriptMode>("s2t");
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function convert(value = text, m = mode) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/convert-script", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: value, mode: m }) });
      const body = (await res.json().catch(() => ({}))) as Partial<ScriptResult> & { error?: string };
      if (!res.ok || body.output === undefined) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa chuyển được, thử lại sau nhé.");
      setResult({ output: body.output, changed: body.changed ?? 0, check: body.check ?? [] });
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* trình duyệt chặn: người dùng tự chọn và sao chép */ }
  }

  const chip = (on: boolean) => `min-h-11 rounded-full border-2 px-4 text-label-md font-semibold transition-colors ${on ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`;
  const current = SCRIPT_MODES.find((m) => m.id === mode)!;
  return (
    <div className="space-y-space-md">
      <div role="group" aria-label="Chiều chuyển" className="flex flex-wrap gap-2">
        {SCRIPT_MODES.map((m) => (
          <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setResult(null); }} className={chip(mode === m.id)}>{m.label}</button>
        ))}
      </div>
      <p className="text-label-md text-on-surface-variant">{current.hint}</p>
      <form onSubmit={(e) => { e.preventDefault(); void convert(); }} className="space-y-3">
        <label htmlFor="script-input" className="block text-label-md font-medium text-on-surface">Nhập chữ Hán</label>
        <textarea
          id="script-input" lang="zh" rows={5} value={text} maxLength={MAX_SCRIPT_CHARS} onChange={(e) => setText(e.target.value)}
          placeholder={`Dán hoặc gõ chữ Hán vào đây, ví dụ: ${EXAMPLES[mode]}`}
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || !text.trim()} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang chuyển…" : "Chuyển đổi"}</button>
          <button type="button" onClick={() => { setText(EXAMPLES[mode]); void convert(EXAMPLES[mode]); }} className="inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-medium text-primary hover:underline">Thử ví dụ</button>
          <span className="ml-auto text-label-sm text-on-surface-variant">{text.length}/{MAX_SCRIPT_CHARS}</span>
        </div>
      </form>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {result && (
        <section aria-label="Kết quả" className="space-y-3">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
            <p lang="zh" className="whitespace-pre-wrap font-serif text-body-lg text-on-surface">{result.output}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={copy} className="inline-flex min-h-11 items-center rounded-full border-2 border-outline-variant px-5 text-label-md font-semibold text-on-surface hover:bg-surface-container-high">{copied ? "Đã sao chép" : "Sao chép kết quả"}</button>
            <span role="status" className="text-label-md text-on-surface-variant">Đã đổi {result.changed} chữ.</span>
          </div>
          {result.check.length > 0 && (
            <div className="rounded-2xl bg-secondary-container p-4 text-on-secondary-container">
              <h3 className="text-label-md font-extrabold">Đọc lại những chữ này</h3>
              <p className="text-label-md">Mỗi chữ giản thể dưới đây có nhiều cách viết phồn thể tùy nghĩa. Công cụ chọn một cách, bạn nên kiểm tra xem có đúng nghĩa trong câu không.</p>
              <ul className="mt-2 space-y-1">
                {result.check.map((c) => (
                  <li key={c.char} className="text-body-md"><span lang="zh" className="mr-2 font-serif text-body-lg font-bold">{c.char}</span>{c.options.join(" · ")}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
