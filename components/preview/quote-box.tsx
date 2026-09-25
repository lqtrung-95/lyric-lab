import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { formatTimestamp } from "@/lib/preview/preview-format";

/** Trích đoạn lời chứa mục học: chữ gốc, thời điểm và bản dịch (chỉ trích một câu, không hiển thị cả bài). */
export function QuoteBox({ line, label }: { line: AnalyzedLine; label: string }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-2.5">
      <div className="mb-1 flex items-center justify-between text-label-sm text-on-surface-variant">
        <span>{label}</span>
        <span className="font-mono font-medium text-primary">{formatTimestamp(line.start)}</span>
      </div>
      <p lang="zh" className="font-serif text-[17px] leading-relaxed text-on-surface">{line.text}</p>
      {line.translation && <p className="text-label-md italic text-on-surface-variant">{line.translation}</p>}
    </div>
  );
}
