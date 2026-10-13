"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_CONVERT_CHARS, type ConvertedLine } from "@/lib/tools/han-converter-shared";
import { HanConverterResult } from "./han-converter-result";

const EXAMPLE = "你好，我是学生。\n今天天气很好。";
const ERRORS: Record<string, string> = {
  no_han: "Hãy nhập ít nhất một chữ Hán (giản thể hoặc phồn thể).",
  rate_limited: "Bạn chuyển hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};

/** Công cụ chuyển chữ Hán sang pinyin và âm Hán Việt (gọi `/api/tools/han-to-pinyin`, chỉ tra từ điển, không dùng AI). */
export function HanConverter() {
  const [text, setText] = useState("");
  const [lines, setLines] = useState<ConvertedLine[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showSinoViet, setShowSinoViet] = useState(true);

  async function convert(value = text) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/han-to-pinyin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: value }) });
      const body = (await res.json().catch(() => ({}))) as { lines?: ConvertedLine[]; error?: string };
      if (!res.ok || !body.lines) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa chuyển được, thử lại sau nhé.");
      setLines(body.lines);
    } catch (e) {
      setLines(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const check = "h-5 w-5 accent-[var(--color-primary)]";
  return (
    <div className="space-y-space-md">
      <form onSubmit={(e) => { e.preventDefault(); void convert(); }} className="space-y-3">
        <label htmlFor="han-input" className="block text-label-md font-medium text-on-surface">Nhập chữ Hán</label>
        <textarea
          id="han-input" lang="zh" rows={5} value={text} maxLength={MAX_CONVERT_CHARS} onChange={(e) => setText(e.target.value)}
          placeholder="Dán hoặc gõ chữ Hán vào đây, ví dụ: 你好，我是学生。"
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || !text.trim()} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">
            {busy ? "Đang chuyển…" : "Chuyển đổi"}
          </button>
          <button type="button" onClick={() => { setText(EXAMPLE); void convert(EXAMPLE); }} className="inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-medium text-primary hover:bg-surface-container-high">Thử với ví dụ</button>
          <span className="ml-auto text-label-sm text-on-surface-variant">{text.length}/{MAX_CONVERT_CHARS}</span>
        </div>
      </form>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {lines && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-label-md text-on-surface">
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className={check} checked={showPinyin} onChange={(e) => setShowPinyin(e.target.checked)} />Hiện pinyin</label>
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className={check} checked={showSinoViet} onChange={(e) => setShowSinoViet(e.target.checked)} />Hiện âm Hán Việt</label>
          </div>
          <HanConverterResult lines={lines} showPinyin={showPinyin} showSinoViet={showSinoViet} />
          <p className="text-label-md text-on-surface-variant">
            Muốn học các từ này qua bài hát và video thật?{" "}
            <Link href="/app" className="font-semibold text-primary underline underline-offset-2">Mở SongHanzi</Link>
          </p>
        </>
      )}
    </div>
  );
}
