"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { HskRow } from "@/lib/tools/build-hsk-rows";
import { buildHskCsv } from "@/lib/tools/hsk-csv";

/** Bỏ dấu và đ→d để gõ "hao" tìm được cả "hǎo" lẫn "hảo" (Hán Việt). */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

/** Bảng từ vựng một cấp HSK: ô tìm (chữ Hán, pinyin có hoặc không dấu, Hán Việt, nghĩa tiếng Anh) và nút tải CSV cho Anki. Bảng cũng được dựng sẵn ở server để công cụ tìm kiếm đọc được. */
export function HskVocabTable({ level, rows }: { level: number; rows: HskRow[] }) {
  const [query, setQuery] = useState("");
  const index = useMemo(() => rows.map((r) => fold(`${r.word} ${r.pinyin} ${r.sinoViet ?? ""} ${r.meanings.join(" ")}`)), [rows]);
  const q = fold(query.trim());
  const shown = useMemo(() => (q ? rows.filter((_, i) => index[i].includes(q)) : rows), [q, rows, index]);

  function download() {
    // BOM để Excel mở đúng tiếng Việt và chữ Hán.
    const blob = new Blob(["﻿", buildHskCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tu-vung-hsk-${level}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-space-sm">
      {/* Khi in chỉ hiện khối #hsk-print (danh sách gọn hai cột có ô tích), ẩn mọi thứ còn lại của trang. */}
      <style>{`@media print { @page { size: A4; margin: 12mm; } body * { visibility: hidden !important; } #hsk-print, #hsk-print * { visibility: visible !important; } #hsk-print { position: absolute; left: 0; top: 0; width: 100%; color: #000; background: #fff; } }`}</style>
      <section id="hsk-print" aria-hidden="true" className="hidden print:block">
        <h1 style={{ fontSize: "16pt", fontWeight: 700 }}>Từ vựng HSK {level} ({shown.length} từ)</h1>
        <p style={{ fontSize: "9pt", color: "#555", marginBottom: "6pt" }}>songhanzi.com/tu-vung-hsk/{level} · Tích vào ô khi bạn đã thuộc từ.</p>
        <ul style={{ columnCount: 2, columnGap: "10mm", listStyle: "none", padding: 0, margin: 0 }}>
          {shown.map((r) => (
            <li key={r.word} style={{ breakInside: "avoid", borderBottom: "0.3pt solid #bbb", padding: "2.5pt 0", fontSize: "9pt", lineHeight: 1.3 }}>
              <span style={{ display: "inline-block", width: "9pt", height: "9pt", border: "0.8pt solid #333", marginRight: "5pt", verticalAlign: "middle" }} />
              <span lang="zh" style={{ fontSize: "13pt", fontWeight: 700, marginRight: "5pt" }}>{r.word}</span>
              <span style={{ marginRight: "5pt" }}>{r.pinyin}</span>
              {r.sinoViet && <span style={{ textTransform: "uppercase", fontWeight: 600, marginRight: "5pt" }}>{r.sinoViet}</span>}
              <span style={{ color: "#444" }}>{r.meanings.slice(0, 2).join("; ")}</span>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-container-high px-4 text-on-surface-variant focus-within:ring-2 focus-within:ring-primary">
          <Icon name="search" size={20} />
          <span className="sr-only">Tìm từ</span>
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm chữ Hán, pinyin, Hán Việt hoặc nghĩa…"
            className="min-h-11 w-full bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
          />
        </label>
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-primary px-5 text-label-md font-semibold text-primary hover:bg-surface-container-high print:hidden">
          <Icon name="list_alt" size={18} />In hoặc lưu PDF
        </button>
        <button type="button" onClick={download} className="print:hidden inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-container px-5 text-label-md font-semibold text-on-primary-container hover:bg-primary hover:text-on-primary">
          <Icon name="download" size={18} />Tải CSV
        </button>
      </div>
      <p role="status" className="text-label-md text-on-surface-variant">{q ? `${shown.length}/${rows.length} từ khớp` : `${rows.length} từ`}</p>
      <div className="overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
        <table className="w-full text-left">
          <caption className="sr-only">Từ vựng HSK {level} kèm pinyin, âm Hán Việt và nghĩa</caption>
          <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
            <tr><th scope="col" className="px-4 py-3 font-medium">Từ</th><th scope="col" className="px-4 py-3 font-medium">Hán Việt</th><th scope="col" className="px-4 py-3 font-medium">Nghĩa</th></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {shown.map((r) => (
              <tr key={r.word} className="align-top">
                <td className="px-4 py-3"><span lang="zh" className="font-serif text-headline-md leading-tight text-on-surface">{r.word}</span><span className="block text-label-md text-primary">{r.pinyin}</span></td>
                <td className="px-4 py-3 text-body-md font-medium uppercase tracking-wide text-on-surface">{r.sinoViet ?? <span className="font-normal text-on-surface-variant">—</span>}</td>
                <td className="px-4 py-3 text-body-md text-on-surface-variant">{r.meanings.join("; ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-space-md text-center text-body-md text-on-surface-variant">Không có từ nào khớp “{query}”.</p>}
      </div>
    </div>
  );
}
