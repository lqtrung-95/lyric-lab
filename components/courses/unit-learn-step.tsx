"use client";

import { Icon } from "@/components/ui/icon";
import { wordLabel } from "@/lib/courses/build-unit-quiz";
import type { UnitWord } from "@/lib/courses/unit-types";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { playChinese } from "@/lib/speech/play-chinese";
import { useState } from "react";
import { UnitFocusCards } from "./unit-focus-cards";

/** Thẻ lưu cho một từ của chặng: lấy câu ví dụ tốt nhất làm nguồn (thẻ ôn cần video và dòng để nghe lại). Từ chưa có câu thật thì chưa lưu được. */
export function savedItemFor(word: UnitWord, now = Date.now()): SavedItem | null {
  const ex = word.examples[0];
  if (!ex) return null;
  return {
    key: itemKey({ type: "vocab", term: word.term }), videoId: ex.videoId, type: "vocab", term: word.term, lineIndex: ex.lineIdx, start: ex.start, savedAt: now,
    reading: word.pinyin, sinoViet: word.sinoViet ?? undefined, level: word.hskLevel, meaning: word.gloss ?? word.meanings[0],
  };
}

/**
 * Bước 1: làm quen với các từ của chặng. Mặc định học từng thẻ (đoán nghĩa trước khi lật, tự đánh giá Nhớ rồi/Chưa nhớ); cuối lượt có tóm tắt và học lại các từ chưa nhớ.
 * Ai thích xem một lượt cả danh sách thì chuyển sang dạng danh sách. Lưu cả nhóm vào bộ ôn bằng một nút ở cả hai dạng.
 */
export function UnitLearnStep({ words, onNext }: { words: UnitWord[]; onNext: () => void }) {
  const { state, toggleSaved } = useLearnerState();
  const [view, setView] = useState<"cards" | "recap" | "list">("cards");
  const [queue, setQueue] = useState(words);
  const [unsure, setUnsure] = useState<string[]>([]);
  const savedKeys = new Set(state.saved.map((s) => s.key));
  const saveable = words.map((w) => savedItemFor(w)).filter((x): x is SavedItem => x !== null);
  const toSave = saveable.filter((s) => !savedKeys.has(s.key));
  const unsaveable = words.length - saveable.length;

  const footer = (
    <div className="flex flex-wrap items-center gap-space-sm">
      <button type="button" disabled={toSave.length === 0} onClick={() => toSave.forEach((s) => toggleSaved(s))} className="btn-3d btn-3d-neutral disabled:opacity-60">
        <Icon name="bookmark_add" size={20} /> {toSave.length === 0 ? "Đã lưu cả nhóm vào bộ ôn" : `Lưu ${toSave.length} từ vào bộ ôn`}
      </button>
      <button type="button" onClick={onNext} className="btn-3d btn-3d-bright">Nghe trong câu thật <Icon name="arrow_forward" size={20} /></button>
    </div>
  );
  const footNote = unsaveable > 0 && <p className="text-body-sm text-on-surface-variant">{unsaveable} từ chưa có câu thật trong video nên chưa lưu được thẻ.</p>;
  const switcher = (to: "cards" | "list", label: string) => (
    <button type="button" onClick={() => { if (to === "cards") { setQueue(words); } setView(to); }} className="inline-flex min-h-11 items-center text-label-md font-bold text-primary hover:underline">{label}</button>
  );

  if (view === "cards") {
    return (
      <div className="space-y-space-sm">
        <UnitFocusCards key={queue.map((w) => w.term).join()} words={queue} onDone={(u) => { setUnsure(u); setView("recap"); }} />
        {switcher("list", "Xem dạng danh sách")}
      </div>
    );
  }
  if (view === "recap") {
    const known = queue.length - unsure.length;
    const again = words.filter((w) => unsure.includes(w.term));
    return (
      <div className="space-y-space-md" data-testid="focus-recap">
        <div className="card-ink p-space-md text-center">
          <p className="font-serif text-headline-lg">{known}/{queue.length}</p>
          <p className="text-body-lg">{again.length === 0 ? "Bạn nhớ hết các từ này rồi!" : "từ bạn đã nhớ ngay lần này"}</p>
          {again.length > 0 && (
            <>
              <ul className="mt-space-sm flex flex-wrap justify-center gap-2" aria-label="Các từ chưa nhớ">
                {again.map((w) => <li key={w.term} className="rounded-xl border-2 border-ink bg-surface-container-low px-3 py-1"><span lang="zh-Hans" className="font-serif text-xl">{w.term}</span> <span className="text-label-md text-on-surface-variant">{wordLabel(w)}</span></li>)}
              </ul>
              <button type="button" onClick={() => { setQueue(again); setView("cards"); }} className="btn-3d btn-3d-primary mt-space-md"><Icon name="replay" size={20} /> Học lại {again.length} từ chưa nhớ</button>
            </>
          )}
        </div>
        {footer}
        {footNote}
      </div>
    );
  }
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
                {w.emoji && <span aria-hidden="true">{w.emoji}</span>}
                <span lang="zh-Hans" className="font-serif text-2xl">{w.term}</span>
                <span className="text-body-md text-primary">{w.pinyin}</span>
                {w.sinoViet && <span className="text-body-sm text-on-surface-variant">Hán Việt: {w.sinoViet}</span>}
              </p>
              <p className="text-body-md">{wordLabel(w)}</p>
            </div>
          </li>
        ))}
      </ul>
      {footer}
      {footNote}
      {switcher("cards", "Học từng thẻ")}
    </div>
  );
}
