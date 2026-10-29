"use client";

import { Icon } from "@/components/ui/icon";
import { grammarSavedItem } from "@/lib/grammar/grammar-saved";
import type { GrammarPattern } from "@/lib/grammar/grammar-types";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

/** Lưu mẫu ngữ pháp vào bộ ôn thẻ (FSRS): thẻ hiện khung mẫu ở mặt trước, công thức và giải thích ở mặt sau. */
export function GrammarSaveButton({ pattern }: { pattern: GrammarPattern }) {
  const { state, toggleSaved } = useLearnerState();
  const item = grammarSavedItem(pattern);
  const saved = state.saved.some((s) => s.key === item.key);
  return (
    <button type="button" aria-pressed={saved} onClick={() => toggleSaved(item)} className={`btn-3d min-h-11 px-4 text-label-md font-extrabold ${saved ? "btn-3d-bright" : "btn-3d-primary"}`}>
      <span className="inline-flex items-center gap-1"><Icon name={saved ? "check_circle" : "bookmark_add"} size={20} filled={saved} /> {saved ? "Đã lưu thẻ ôn" : "Lưu vào thẻ ôn"}</span>
    </button>
  );
}
