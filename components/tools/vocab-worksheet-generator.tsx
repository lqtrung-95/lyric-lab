"use client";

import { useState } from "react";
import { HSK_LEVELS } from "@/lib/tools/build-hsk-rows";
import { MAX_CONVERT_CHARS, type ConvertedLine } from "@/lib/tools/han-converter-shared";
import { DEFAULT_SAMPLE } from "@/lib/tools/hsk-sample";
import { savedCardsToLines } from "@/lib/tools/saved-words-lines";
import { loadPracticeCards } from "@/lib/user-data/practice-repo";
import { DEFAULT_OPTIONS, MAX_WORDS, buildMatch, canMatchMeaning, parseWordList, type MatchExercise, type SheetOptions, type VocabItem } from "@/lib/tools/vocab-worksheet";
import { VocabWorksheetSheet } from "./vocab-worksheet-sheet";

const ERRORS: Record<string, string> = { no_han: "Hãy nhập ít nhất một từ tiếng Trung.", rate_limited: "Bạn tạo hơi nhiều lần rồi, thử lại sau ít phút nhé." };
/** Bộ từ gợi ý để thử ngay (từ cơ bản, nghĩa tự ghi). */
const PRESETS: { label: string; text: string }[] = [
  { label: "Gia đình", text: "爸爸, bố\n妈妈, mẹ\n哥哥, anh trai\n姐姐, chị gái\n弟弟, em trai\n妹妹, em gái\n爷爷, ông nội\n奶奶, bà nội" },
  { label: "Đồ ăn thức uống", text: "米饭, cơm\n面条, mì\n饺子, sủi cảo\n苹果, táo\n牛奶, sữa\n鸡蛋, trứng gà\n茶, trà\n水, nước" },
  { label: "Chào hỏi", text: "你好, xin chào\n谢谢, cảm ơn\n对不起, xin lỗi\n再见, tạm biệt\n请, mời, xin\n没关系, không sao" },
];
const SECTIONS: { key: keyof SheetOptions; label: string }[] = [
  { key: "matchPinyin", label: "Nối chữ Hán với pinyin" }, { key: "matchMeaning", label: "Nối chữ Hán với nghĩa (cần ghi nghĩa cho mọi từ)" },
  { key: "writePinyin", label: "Viết pinyin" }, { key: "writeHan", label: "Viết chữ Hán từ pinyin" }, { key: "answerKey", label: "Trang đáp án" },
];

/**
 * Tờ bài tập từ vựng: dán danh sách từ (mỗi dòng một từ, có thể kèm nghĩa tiếng Việt), chọn các phần bài tập, nhận tờ A4 có đáp án để in hoặc lưu PDF.
 * Pinyin và âm Hán Việt lấy từ từ điển qua API `han-to-pinyin`; việc dựng bài chạy hoàn toàn ở trình duyệt.
 */
export function VocabWorksheetGenerator() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Bài tập từ vựng");
  const [options, setOptions] = useState<SheetOptions>(DEFAULT_OPTIONS);
  const [sheet, setSheet] = useState<{ items: VocabItem[]; pinyin: MatchExercise; meaning: MatchExercise | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hskLevel, setHskLevel] = useState<number>(1);
  const [hskCount, setHskCount] = useState(DEFAULT_SAMPLE);

  async function generate(value = text) {
    const entries = parseWordList(value);
    if (entries.length === 0) { setError(ERRORS.no_han); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/han-to-pinyin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: entries.map((e) => e.zh).join("\n") }) });
      const body = (await res.json().catch(() => ({}))) as { lines?: ConvertedLine[]; error?: string };
      if (!res.ok || !body.lines) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa tạo được, thử lại sau nhé.");
      const items = entries.map((e, i): VocabItem => {
        const toks = body.lines![i]?.tokens.filter((t) => t.pinyin) ?? [];
        return { ...e, pinyin: toks.map((t) => t.pinyin).join(" "), sinoViet: toks.map((t) => t.sinoViet).filter(Boolean).join(" ") || null };
      });
      setSheet({ items, pinyin: buildMatch(items.map((i) => i.pinyin)), meaning: canMatchMeaning(items) ? buildMatch(items.map((i) => i.meaning!)) : null });
    } catch (e) {
      setSheet(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Lấy ngẫu nhiên từ một cấp HSK (kèm nghĩa tiếng Anh), điền vào ô danh sách rồi tạo luôn tờ bài tập. */
  async function loadHsk() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tools/hsk-words?level=${hskLevel}&count=${hskCount}`);
      const body = (await res.json().catch(() => ({}))) as { lines?: string[]; error?: string };
      if (!res.ok || !body.lines?.length) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa lấy được từ HSK, thử lại sau nhé.");
      const value = body.lines.join("\n");
      setText(value);
      await generate(value);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  /** Lấy ngẫu nhiên từ vựng đã lưu của tài khoản (cần có phiên và có thẻ), điền vào ô danh sách rồi tạo tờ bài tập. */
  async function loadSaved() {
    setBusy(true);
    setError(null);
    try {
      const { cards } = await loadPracticeCards();
      const lines = savedCardsToLines(cards, hskCount);
      if (lines.length === 0) throw new Error("Chưa thấy từ vựng đã lưu nào. Hãy đăng nhập hoặc lưu từ khi xem trước một bài hát trong app, rồi quay lại đây.");
      const value = lines.join("\n");
      setText(value);
      await generate(value);
    } catch (e) {
      setError((e as Error).message || "Chưa lấy được từ đã lưu, thử lại sau nhé.");
      setBusy(false);
    }
  }

  const toggle = (k: keyof SheetOptions) => setOptions((o) => ({ ...o, [k]: !o[k] }));
  return (
    <div className="space-y-space-md">
      <style>{`@media print { @page { size: A4; margin: 12mm; } html, body { background: #fff !important; } }`}</style>
      <form onSubmit={(e) => { e.preventDefault(); void generate(); }} className="space-y-3 print:hidden">
        <label htmlFor="vocab-input" className="block text-label-md font-medium text-on-surface">Danh sách từ: mỗi dòng một từ, có thể ghi nghĩa sau dấu phẩy (tối đa {MAX_WORDS} từ)</label>
        <textarea id="vocab-input" lang="zh" rows={7} value={text} maxLength={MAX_CONVERT_CHARS} onChange={(e) => setText(e.target.value)} placeholder={"你好, xin chào\n谢谢, cảm ơn\n老师, giáo viên"}
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-md text-on-surface-variant">Bộ từ gợi ý:</span>
          {PRESETS.map((p) => <button key={p.label} type="button" onClick={() => { setText(p.text); void generate(p.text); }} className="min-h-11 rounded-full border border-outline-variant px-4 text-label-md font-medium hover:bg-surface-container">{p.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface-container-low p-3">
          <span className="text-label-md font-medium text-on-surface">Hoặc lấy ngẫu nhiên:</span>
          <select aria-label="Cấp HSK" value={hskLevel} onChange={(e) => setHskLevel(Number(e.target.value))} className="min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-body-md">
            {HSK_LEVELS.map((l) => <option key={l} value={l}>HSK {l}</option>)}
          </select>
          <select aria-label="Số từ" value={hskCount} onChange={(e) => setHskCount(Number(e.target.value))} className="min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-body-md">
            {[8, 12, 16, 20].map((n) => <option key={n} value={n}>{n} từ</option>)}
          </select>
          <button type="button" onClick={() => void loadHsk()} disabled={busy} className="min-h-11 rounded-full border-2 border-primary px-5 text-label-md font-semibold text-primary hover:bg-primary-container disabled:opacity-50">Lấy từ và tạo bài</button>
          <button type="button" onClick={() => void loadSaved()} disabled={busy} className="min-h-11 rounded-full border-2 border-primary px-5 text-label-md font-semibold text-primary hover:bg-primary-container disabled:opacity-50">Từ đã lưu của tôi</button>
          <span className="text-label-md text-on-surface-variant">Từ HSK có nghĩa tiếng Việt; từ đã lưu dùng nghĩa bạn đã lưu. Bấm lại để có bộ từ khác.</span>
        </div>
        <label className="flex flex-col gap-1 text-label-md font-medium text-on-surface">Tiêu đề tờ bài tập
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} className="min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-body-md font-normal" /></label>
        <fieldset className="flex flex-wrap gap-x-6 gap-y-1">
          <legend className="text-label-md font-medium text-on-surface">Các phần bài tập</legend>
          {SECTIONS.map((s) => <label key={s.key} className="flex min-h-11 items-center gap-2 text-label-md text-on-surface"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={options[s.key]} onChange={() => toggle(s.key)} />{s.label}</label>)}
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || !text.trim()} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang tạo…" : "Tạo bài tập"}</button>
          {sheet && <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-6 text-label-md font-semibold text-primary hover:bg-primary-container">In hoặc lưu PDF</button>}
          {sheet && !sheet.meaning && options.matchMeaning && <p className="text-label-md text-on-surface-variant">Bài nối với nghĩa bị bỏ vì chưa ghi nghĩa cho mọi từ.</p>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      </form>
      {sheet && <VocabWorksheetSheet title={title} items={sheet.items} options={options} matchPinyin={sheet.pinyin} matchMeaning={sheet.meaning} />}
    </div>
  );
}
