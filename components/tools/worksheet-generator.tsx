"use client";

import { useState } from "react";
import { MAX_CONVERT_CHARS, type ConvertedLine } from "@/lib/tools/han-converter-shared";
import { PAPER_COLORS, A4 } from "@/lib/tools/writing-paper";
import { cellsPerRow, MAX_WORKSHEET_CHARS, SHEET, TRACE_RANGE, uniqueHanChars, worksheetPages, type WorksheetChar, type WorksheetGrid } from "@/lib/tools/worksheet-layout";

const ERRORS: Record<string, string> = {
  no_han: "Hãy nhập ít nhất một chữ Hán.",
  rate_limited: "Bạn tạo hơi nhiều lần rồi, thử lại sau ít phút nhé.",
};
/** Bộ chữ gợi ý để luyện ngay (chữ cơ bản, tự chọn). */
const PRESETS: { label: string; chars: string }[] = [
  { label: "Số 1–10", chars: "一二三四五六七八九十" },
  { label: "Màu sắc", chars: "红黄蓝绿白黑" },
  { label: "Gia đình", chars: "爸妈哥姐弟妹你我他" },
  { label: "Cơ thể", chars: "头手脚眼口耳" },
  { label: "Chữ cơ bản", chars: "大小人天日月山水火木" },
];
const GRIDS: { id: WorksheetGrid; label: string }[] = [{ id: "tianzige", label: "田字格" }, { id: "mizige", label: "米字格" }, { id: "square", label: "Ô vuông" }];
const KAI = '"Kaiti SC", "KaiTi", "STKaiti", "Noto Serif SC", "Songti SC", serif';
const chip = (on: boolean) => `min-h-11 rounded-full border-2 px-4 text-label-md font-semibold transition-colors ${on ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`;

/** Tờ tập viết chữ Hán: nhập chữ, mỗi chữ một hàng (chữ mẫu, ô mờ để tô theo, ô trống để tự viết), có pinyin và âm Hán Việt; in hoặc lưu PDF khổ A4. */
export function WorksheetGenerator() {
  const [text, setText] = useState("");
  const [grid, setGrid] = useState<WorksheetGrid>("tianzige");
  const [traceCells, setTraceCells] = useState(3);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showSinoViet, setShowSinoViet] = useState(true);
  const [chars, setChars] = useState<WorksheetChar[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(value = text) {
    const list = uniqueHanChars(value);
    if (list.length === 0) { setError(ERRORS.no_han); return; }
    setBusy(true);
    setError(null);
    try {
      // Mỗi chữ một dòng để nhận pinyin và âm Hán Việt riêng của từng chữ.
      const res = await fetch("/api/tools/han-to-pinyin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: list.join("\n") }) });
      const body = (await res.json().catch(() => ({}))) as { lines?: ConvertedLine[]; error?: string };
      if (!res.ok || !body.lines) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa tạo được, thử lại sau nhé.");
      setChars(list.map((ch, i) => {
        const t = body.lines![i]?.tokens.find((tok) => tok.pinyin) ?? null;
        return { ch, pinyin: t?.pinyin ?? null, sinoViet: t?.sinoViet ?? null };
      }));
    } catch (e) {
      setChars(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const pages = chars ? worksheetPages(chars, { grid, traceCells, showPinyin, showSinoViet }) : [];
  const cols = cellsPerRow();
  const x0 = SHEET.margin + SHEET.infoW;
  const ink = PAPER_COLORS.gray;
  return (
    <div className="space-y-space-md">
      <style>{`@media print { @page { size: A4; margin: 0; } html, body { background: #fff !important; } }`}</style>
      <div className="space-y-space-md print:hidden">
        <form onSubmit={(e) => { e.preventDefault(); void generate(); }} className="space-y-3">
          <label htmlFor="worksheet-input" className="block text-label-md font-medium text-on-surface">Nhập chữ Hán muốn luyện viết (tối đa {MAX_WORKSHEET_CHARS} chữ khác nhau)</label>
          <textarea id="worksheet-input" lang="zh" rows={3} value={text} maxLength={MAX_CONVERT_CHARS} onChange={(e) => setText(e.target.value)} placeholder="Ví dụ: 你好我是学生"
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label-md text-on-surface-variant">Bộ chữ gợi ý:</span>
            {PRESETS.map((p) => <button key={p.label} type="button" onClick={() => { setText(p.chars); void generate(p.chars); }} className="min-h-11 rounded-full border border-outline-variant px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-high">{p.label}</button>)}
          </div>
          <div role="group" aria-label="Kiểu ô" className="flex flex-wrap items-center gap-2">
            <span className="text-label-md font-medium text-on-surface">Kiểu ô:</span>
            {GRIDS.map((g) => <button key={g.id} type="button" aria-pressed={grid === g.id} onClick={() => setGrid(g.id)} className={chip(grid === g.id)}>{g.label}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <label className="flex min-h-11 items-center gap-3 text-label-md font-medium text-on-surface">Ô mờ để tô theo: {traceCells}
              <input type="range" min={TRACE_RANGE.min} max={TRACE_RANGE.max} value={traceCells} onChange={(e) => setTraceCells(Number(e.target.value))} className="h-11 w-40 accent-[var(--color-primary)]" /></label>
            <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={showPinyin} onChange={(e) => setShowPinyin(e.target.checked)} />Hiện pinyin</label>
            <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={showSinoViet} onChange={(e) => setShowSinoViet(e.target.checked)} />Hiện âm Hán Việt</label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy || !text.trim()} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "Đang tạo…" : "Tạo tờ tập viết"}</button>
            {pages.length > 0 && <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-6 text-label-md font-semibold text-primary hover:bg-surface-container-high">In hoặc lưu PDF ({pages.length} trang)</button>}
          </div>
        </form>
        {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      </div>
      {pages.map((page, pi) => (
        <svg key={pi} role="img" aria-label={`Tờ tập viết trang ${pi + 1}`} viewBox={`0 0 ${A4.widthMm} ${A4.heightMm}`}
          className="mx-auto h-auto w-full max-w-xl rounded-lg border border-outline-variant bg-white shadow-sm print:h-[297mm] print:w-[210mm] print:max-w-none print:break-after-page print:rounded-none print:border-0 print:shadow-none">
          <text x={SHEET.margin} y={SHEET.margin + 6} fontSize={5} fontWeight={700} fill="#222">Tờ tập viết chữ Hán</text>
          <text x={A4.widthMm - SHEET.margin} y={SHEET.margin + 6} fontSize={3.2} textAnchor="end" fill="#555">Tên: ____________  Ngày: ________</text>
          {page.segments.map((s, i) => <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={ink} strokeWidth={s.dashed ? 0.2 : 0.35} strokeDasharray={s.dashed ? "1.2 1.2" : undefined} />)}
          {page.rows.map((r) => (
            <g key={r.y}>
              {showPinyin && r.char.pinyin && <text x={SHEET.margin} y={r.y + 6} fontSize={4} fontWeight={700} fill="#222">{r.char.pinyin}</text>}
              {showSinoViet && r.char.sinoViet && <text x={SHEET.margin} y={r.y + 11} fontSize={3.2} fill="#666">{r.char.sinoViet}</text>}
              {Array.from({ length: cols }).slice(0, 1 + traceCells).map((_, ci) => (
                <text key={ci} x={x0 + ci * SHEET.cell + SHEET.cell / 2} y={r.y + SHEET.cell * 0.78} fontSize={SHEET.cell * 0.8} textAnchor="middle" fontFamily={KAI} fill={ci === 0 ? "#111" : "#bdbdbd"}>{r.char.ch}</text>
              ))}
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
