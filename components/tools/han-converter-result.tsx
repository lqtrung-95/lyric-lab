"use client";

import { useState } from "react";
import { copyText } from "@/components/room/copy-text";
import { joinField, type ConvertedLine } from "@/lib/tools/han-converter-shared";

type Field = "pinyin" | "sinoViet";

/** Kết quả chuyển đổi: mỗi từ một khối (pinyin trên, chữ giữa, Hán Việt dưới) và hai nút sao chép toàn bộ pinyin hoặc Hán Việt. */
export function HanConverterResult({ lines, showSinoViet, showPinyin }: { lines: ConvertedLine[]; showSinoViet: boolean; showPinyin: boolean }) {
  const [copied, setCopied] = useState<Field | null>(null);
  async function copy(field: Field) {
    if (await copyText(joinField(lines, field))) {
      setCopied(field);
      setTimeout(() => setCopied((c) => (c === field ? null : c)), 1500);
    }
  }
  const btn = "inline-flex min-h-11 items-center rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-highest";
  return (
    <section aria-label="Kết quả" className="space-y-space-md rounded-3xl bg-surface-container-lowest p-space-md shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
      <div className="space-y-4">
        {lines.map((line, i) => (
          <p key={i} lang="zh" className="flex flex-wrap items-end gap-x-3 gap-y-3">
            {line.tokens.map((t, j) => (
              <span key={j} className="inline-flex flex-col items-center text-center">
                {showPinyin && <span lang="vi" className="min-h-5 text-label-md text-primary">{t.pinyin ?? " "}</span>}
                <span className="font-serif text-headline-md leading-tight text-on-surface">{t.text}</span>
                {showSinoViet && <span lang="vi" className="min-h-5 text-label-sm uppercase tracking-wide text-on-surface-variant">{t.sinoViet ?? " "}</span>}
              </span>
            ))}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy("pinyin")} className={btn}>{copied === "pinyin" ? "Đã sao chép pinyin" : "Sao chép pinyin"}</button>
        <button type="button" onClick={() => void copy("sinoViet")} className={btn}>{copied === "sinoViet" ? "Đã sao chép Hán Việt" : "Sao chép Hán Việt"}</button>
      </div>
    </section>
  );
}
