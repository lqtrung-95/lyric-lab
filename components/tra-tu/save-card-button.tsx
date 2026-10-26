"use client";

import { Icon } from "@/components/ui/icon";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

/** Nút "Lưu thẻ ôn": đưa từ vào bộ ôn FSRS. Thẻ cần câu thật làm nguồn nên khi từ chưa có câu (`item` null) nút bị khóa kèm lời giải thích. */
export function SaveCardButton({ term, item }: { term: string; item: SavedItem | null }) {
  const { state, toggleSaved } = useLearnerState();
  const saved = state.saved.some((s) => s.key === itemKey({ type: "vocab", term }));
  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={!item && !saved}
        aria-pressed={saved}
        onClick={() => item && toggleSaved(item)}
        className={`btn-3d min-h-11 px-4 text-label-md font-extrabold ${saved ? "btn-3d-bright" : "btn-3d-primary"}`}
      >
        <span className="inline-flex items-center gap-1"><Icon name={saved ? "check_circle" : "bookmark_add"} size={20} filled={saved} /> {saved ? "Đã lưu thẻ ôn" : "Lưu thẻ ôn"}</span>
      </button>
      {!item && !saved && <p className="text-body-sm text-on-surface-variant">Từ này chưa có câu thật trong kho để làm nguồn thẻ ôn.</p>}
    </div>
  );
}
