"use client";

import { useState } from "react";
import { A4, CELL_RANGE, MARGIN_RANGE, PAPER_COLORS, PAPER_TYPES, paperLayout, type PaperColor, type PaperType } from "@/lib/tools/writing-paper";

const COLOR_LABEL: Record<PaperColor, string> = { gray: "Xám", red: "Đỏ", green: "Xanh lá" };
const chip = (on: boolean) => `min-h-11 rounded-full border-2 px-4 text-label-md font-semibold transition-colors ${on ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`;

/** Giấy tập viết chữ Hán in được: chọn kiểu ô, cỡ ô, lề và màu; xem trước một trang A4 rồi bấm in hoặc lưu PDF (hộp thoại in của trình duyệt). */
export function WritingPaper() {
  const [type, setType] = useState<PaperType>("tianzige");
  const [cellMm, setCellMm] = useState(20);
  const [marginMm, setMarginMm] = useState(10);
  const [color, setColor] = useState<PaperColor>("gray");
  const layout = paperLayout({ type, cellMm, marginMm });
  const stroke = PAPER_COLORS[color];
  const hint = PAPER_TYPES.find((p) => p.id === type)!.hint;
  return (
    <div className="space-y-space-md">
      {/* Khi in chỉ giữ tờ giấy: khổ A4, không lề trang của trình duyệt. */}
      <style>{`@media print { @page { size: A4; margin: 0; } html, body { background: #fff !important; } }`}</style>
      <div className="space-y-space-md print:hidden">
        <div role="group" aria-label="Kiểu giấy" className="flex flex-wrap gap-2">
          {PAPER_TYPES.map((p) => <button key={p.id} type="button" aria-pressed={type === p.id} onClick={() => setType(p.id)} className={chip(type === p.id)}>{p.label}</button>)}
        </div>
        <p className="text-label-md text-on-surface-variant">{hint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-label-md font-medium text-on-surface">Cỡ ô: {cellMm} mm
            <input type="range" min={CELL_RANGE.min} max={CELL_RANGE.max} value={cellMm} onChange={(e) => setCellMm(Number(e.target.value))} className="mt-2 block h-11 w-full accent-[var(--color-primary)]" />
          </label>
          <label className="block text-label-md font-medium text-on-surface">Lề trang: {marginMm} mm
            <input type="range" min={MARGIN_RANGE.min} max={MARGIN_RANGE.max} value={marginMm} onChange={(e) => setMarginMm(Number(e.target.value))} className="mt-2 block h-11 w-full accent-[var(--color-primary)]" />
          </label>
        </div>
        <div role="group" aria-label="Màu đường kẻ" className="flex flex-wrap items-center gap-2">
          <span className="text-label-md font-medium text-on-surface">Màu đường kẻ:</span>
          {(Object.keys(PAPER_COLORS) as PaperColor[]).map((c) => <button key={c} type="button" aria-pressed={color === c} onClick={() => setColor(c)} className={chip(color === c)}>{COLOR_LABEL[c]}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110">In hoặc lưu PDF</button>
          <span className="text-label-md text-on-surface-variant">{layout.cols} cột × {layout.rows} hàng trên một trang A4. Trong hộp thoại in, chọn &quot;Lưu thành PDF&quot; nếu muốn lưu file.</span>
        </div>
      </div>
      <svg
        role="img" aria-label={`Trang giấy tập viết ${layout.cols} cột ${layout.rows} hàng`} viewBox={`0 0 ${A4.widthMm} ${A4.heightMm}`}
        className="mx-auto h-auto w-full max-w-md rounded-lg border border-outline-variant bg-white shadow-sm print:h-[297mm] print:w-[210mm] print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      >
        {layout.segments.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={stroke} strokeWidth={s.dashed ? 0.2 : 0.35} strokeDasharray={s.dashed ? "1.2 1.2" : undefined} />
        ))}
      </svg>
    </div>
  );
}
