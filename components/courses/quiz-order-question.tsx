"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/courses/build-unit-quiz";
import { playSfx } from "@/lib/feedback/sfx";
import { playChinese } from "@/lib/speech/play-chinese";
import type { QuizResult } from "./quiz-result";

/**
 * Sắp xếp câu: bấm các mảnh chữ Hán theo thứ tự để ghép thành câu đúng (bấm mảnh đã đặt để gỡ ra), rồi bấm "Kiểm tra".
 * Chấm sai thì hiện câu đúng; câu thật nghe lại được. Đáp án so theo chuỗi chữ (không tính dấu câu).
 */
export function QuizOrderQuestion({ q, onDone }: { q: QuizQuestion; onDone: (r: QuizResult) => void }) {
  const chunks = q.chunks ?? [];
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const free = chunks.map((_, i) => i).filter((i) => !placed.includes(i));

  function check() {
    const ok = placed.map((i) => chunks[i]).join("") === q.sentence;
    setChecked(ok);
    playSfx(ok ? "correct" : "wrong");
    onDone({ correct: ok, right: ok ? [q.term] : [], wrong: ok ? [] : [q.term] });
  }

  const tile = (extra: string) => `min-h-12 rounded-xl border-2 px-3 font-serif text-2xl ${extra}`;
  return (
    <div className="space-y-space-sm">
      {q.hint && <p className="text-body-md text-on-surface-variant">{q.hint}</p>}
      <div aria-label="Câu của bạn" className={`flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-2 ${checked === null ? "border-outline" : checked ? "border-primary bg-primary-container/40" : "border-error bg-error-container/40"}`}>
        {placed.length === 0 && <span className="text-body-md text-on-surface-variant">Bấm các mảnh bên dưới theo thứ tự…</span>}
        {placed.map((i) => (
          <button key={i} type="button" lang="zh-Hans" disabled={checked !== null} onClick={() => setPlaced((p) => p.filter((x) => x !== i))} className={tile("border-ink bg-surface-container-lowest")}>{chunks[i]}</button>
        ))}
      </div>
      <div aria-label="Các mảnh" className="flex flex-wrap gap-2">
        {free.map((i) => (
          <button key={i} type="button" lang="zh-Hans" disabled={checked !== null} onClick={() => setPlaced((p) => [...p, i])} className={tile("border-outline-variant bg-surface-container hover:bg-surface-container-high")}>{chunks[i]}</button>
        ))}
      </div>
      {checked === null ? (
        <button type="button" disabled={placed.length !== chunks.length} onClick={check} className="btn-3d btn-3d-secondary disabled:opacity-50">Kiểm tra</button>
      ) : (
        <div role="status" className="space-y-1">
          <p className="text-body-lg font-bold">{checked ? "Chính xác!" : "Chưa đúng. Câu đúng là:"}</p>
          <p className="flex flex-wrap items-center gap-2"><span lang="zh-Hans" className="font-serif text-2xl">{q.prompt}</span>
            <button type="button" onClick={() => void playChinese(q.prompt)} aria-label="Nghe câu" className="inline-flex size-11 items-center justify-center rounded-full bg-surface-container-high text-primary">🔊</button></p>
        </div>
      )}
    </div>
  );
}
