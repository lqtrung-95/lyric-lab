"use client";

import { Icon } from "@/components/ui/icon";
import type { Objective } from "@/lib/explore/story/story-types";

/** Thanh mục tiêu trên đầu cảnh cốt truyện: việc cần làm tiếp theo, tiến độ vụ án, lối vào sổ vụ án và bản đồ. */
export function ObjectiveBar({ title, objective, done, total, solved, clueCount, freeRoam, onCase, onMap }: { title: string; objective: Objective | null; freeRoam?: boolean; done: number; total: number; solved: boolean; clueCount: number; onCase: () => void; onMap: () => void }) {
  return (
    <section aria-label="Mục tiêu" className="card-ink flex flex-col gap-2 p-space-sm sm:flex-row sm:items-center sm:gap-x-4">
      <div className="min-w-0 flex-1">
        <p className="text-label-md font-extrabold text-on-surface-variant">{title}{total > 0 && ` · ${done}/${total}`}</p>
        <p className="text-body-md font-bold">{solved ? "Vụ án đã được giải. Chúc mừng thám tử!" : objective ? objective.text : freeRoam ? "Tự do điều tra: đi đâu, hỏi ai tùy bạn. Mở sổ vụ án để xem câu hỏi cần làm rõ và nối các manh mối lại." : "Hãy xem sổ vụ án để suy luận."}</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:flex">
        <button type="button" onClick={onCase} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-extrabold hover:bg-surface-container-low"><Icon name="menu_book" size={18} />Sổ vụ án ({clueCount})</button>
        <button type="button" onClick={onMap} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-extrabold hover:bg-surface-container-low"><Icon name="flag" size={18} />Bản đồ</button>
      </div>
    </section>
  );
}
