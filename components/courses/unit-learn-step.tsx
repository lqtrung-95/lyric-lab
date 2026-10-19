"use client";

import { Icon } from "@/components/ui/icon";
import { wordLabel } from "@/lib/courses/build-unit-quiz";
import type { UnitWord } from "@/lib/courses/unit-types";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { playChinese } from "@/lib/speech/play-chinese";

/** Thẻ lưu cho một từ của chặng: lấy câu ví dụ tốt nhất làm nguồn (thẻ ôn cần video và dòng để nghe lại). Từ chưa có câu thật thì chưa lưu được. */
export function savedItemFor(word: UnitWord, now = Date.now()): SavedItem | null {
  const ex = word.examples[0];
  if (!ex) return null;
  return {
    key: itemKey({ type: "vocab", term: word.term }), videoId: ex.videoId, type: "vocab", term: word.term, lineIndex: ex.lineIdx, start: ex.start, savedAt: now,
    reading: word.pinyin, sinoViet: word.sinoViet ?? undefined, level: word.hskLevel, meaning: word.gloss ?? word.meanings[0],
  };
}

/** Bước 1: làm quen với các từ của chặng (nghe, pinyin, Hán Việt, nghĩa) và lưu cả nhóm vào bộ ôn bằng một nút. */
export function UnitLearnStep({ words, onNext }: { words: UnitWord[]; onNext: () => void }) {
  const { state, toggleSaved } = useLearnerState();
  const savedKeys = new Set(state.saved.map((s) => s.key));
  const saveable = words.map((w) => savedItemFor(w)).filter((x): x is SavedItem => x !== null);
  const toSave = saveable.filter((s) => !savedKeys.has(s.key));
  const unsaveable = words.length - saveable.length;

  return (
    <div className="space-y-space-md">
      <ul className="grid gap-2 sm:grid-cols-2">
        {words.map((w) => (
          <li key={w.term} className="flex items-center gap-space-sm rounded-2xl border border-outline-variant bg-surface-container-low p-space-sm">
            <button type="button" onClick={() => void playChinese(w.term)} aria-label={`Nghe ${w.term}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest">
              <Icon name="volume_up" size={22} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span lang="zh-Hans" className="font-serif text-2xl">{w.term}</span>
                <span className="text-body-md text-primary">{w.pinyin}</span>
                {w.sinoViet && <span className="text-body-sm text-on-surface-variant">Hán Việt: {w.sinoViet}</span>}
              </p>
              <p className="text-body-md">{wordLabel(w)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-space-sm">
        <button type="button" disabled={toSave.length === 0} onClick={() => toSave.forEach((s) => toggleSaved(s))} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container disabled:opacity-60">
          <Icon name="bookmark_add" size={20} /> {toSave.length === 0 ? "Đã lưu cả nhóm vào bộ ôn" : `Lưu ${toSave.length} từ vào bộ ôn`}
        </button>
        <button type="button" onClick={onNext} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">
          Nghe trong câu thật <Icon name="arrow_forward" size={20} />
        </button>
      </div>
      {unsaveable > 0 && <p className="text-body-sm text-on-surface-variant">{unsaveable} từ chưa có câu thật trong video nên chưa lưu được thẻ.</p>}
    </div>
  );
}
