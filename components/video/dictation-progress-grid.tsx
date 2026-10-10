"use client";

import { useEffect, useRef } from "react";

const dotClass = (score: number | undefined) =>
  score === undefined ? "bg-surface-container-highest" : score >= 0.85 ? "bg-emerald-600 dark:bg-emerald-400" : score >= 0.5 ? "bg-amber-500 dark:bg-amber-400" : "bg-rose-600 dark:bg-rose-400";

/**
 * Lưới tiến độ: mỗi câu một chấm, tô theo điểm lần làm gần nhất (xanh lá từ 85%, vàng từ 50%, đỏ dưới đó, chưa làm là xám) và viền đậm ở câu đang làm; bấm một chấm để nhảy tới câu đó. Video dài thì
 * lưới cuộn trong khung cao cố định và tự cuộn tới câu đang làm. Điểm có trong tên truy cập của từng chấm (không chỉ dựa vào màu).
 */
export function DictationProgressGrid({ idxs, scores, position, onJump }: { idxs: number[]; scores: Record<number, number>; position: number; onJump: (position: number) => void }) {
  const current = useRef<HTMLButtonElement>(null);
  useEffect(() => { current.current?.scrollIntoView({ block: "nearest" }); }, [position]);
  return (
    <div role="group" aria-label="Tiến độ từng câu" className="flex max-h-32 flex-wrap gap-0.5 overflow-y-auto rounded-xl bg-surface-container-low p-1.5">
      {idxs.map((idx, i) => {
        const score = scores[idx];
        return (
          <button
            key={idx} ref={i === position ? current : undefined} type="button" onClick={() => onJump(i)}
            aria-label={`Câu ${i + 1}${score === undefined ? ", chưa làm" : `, ${Math.round(score * 100)} phần trăm`}`} aria-current={i === position ? "step" : undefined}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface-container-high"
          >
            <span aria-hidden="true" className={`h-3 w-3 rounded-[4px] ${dotClass(score)} ${i === position ? "ring-2 ring-on-surface ring-offset-1 ring-offset-surface-container-low" : ""}`} />
          </button>
        );
      })}
    </div>
  );
}
