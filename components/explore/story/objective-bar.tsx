"use client";

import { Icon } from "@/components/ui/icon";
import { HintToggles } from "./hint-toggles";
import { useStoryHints } from "./use-story-hints";
import type { Objective } from "@/lib/explore/story/story-types";

/** Thanh mục tiêu trên đầu cảnh cốt truyện: việc cần làm tiếp theo, tiến độ vụ án, lối vào sổ vụ án và bản đồ. */
export function ObjectiveBar({ title, objective, done, total, solved, clueCount, freeRoam, spotHint, onCase, onMap }: { title: string; objective: Objective | null; freeRoam?: boolean; done: number; total: number; solved: boolean; clueCount: number; spotHint: { left: number; remaining: number; activeId: string | null; use: () => void }; onCase: () => void; onMap: () => void }) {
  const { hints, toggle } = useStoryHints();
  const onOff = (on: boolean) => (on ? "bật" : "tắt");
  return (
    <section aria-label="Mục tiêu" className="card-ink flex flex-col gap-2 p-space-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-x-4">
        <div className="min-w-0 flex-1">
          <p className="text-label-md font-extrabold text-on-surface-variant">{title}{total > 0 && ` · ${done}/${total}`}</p>
          <p className="text-body-md font-bold">{solved ? "Vụ án đã được giải. Chúc mừng thám tử!" : objective ? objective.text : freeRoam ? "Tự do điều tra: đi đâu, hỏi ai tùy bạn. Xem sổ vụ án để biết câu hỏi cần làm rõ." : "Hãy xem sổ vụ án để suy luận."}</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 md:flex md:shrink-0">
          <button type="button" onClick={onCase} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-extrabold hover:bg-surface-container-low"><Icon name="menu_book" size={18} />Sổ vụ án ({clueCount})</button>
          <button type="button" onClick={onMap} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-extrabold hover:bg-surface-container-low"><Icon name="flag" size={18} />Bản đồ</button>
        </div>
      </div>
      {/* Gợi ý đọc cho cả vụ án: hàng riêng, nhỏ gọn, tách khỏi hai nút điều hướng. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t-2 border-outline-variant pt-2">
        <span className="text-label-md font-extrabold text-on-surface-variant">Gợi ý đọc:</span>
        <div className="[&_button]:!min-h-9 [&_button]:!px-3 [&_button]:!text-[13px]"><HintToggles hints={hints} onToggle={toggle} /></div>
        <span className="text-label-md text-on-surface-variant">Pinyin {onOff(hints.pinyin)}, nghĩa {onOff(hints.vi)}{!hints.pinyin && !hints.vi ? " (luyện đọc)" : ""}</span>
        {spotHint.remaining > 0 && (
          <button type="button" onClick={spotHint.use} disabled={spotHint.left <= 0 || !!spotHint.activeId} className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-[13px] font-extrabold hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50">
            <Icon name="search" size={16} />Gợi ý chỗ cần xem ({Math.max(spotHint.left, 0)})
          </button>
        )}
      </div>
    </section>
  );
}
