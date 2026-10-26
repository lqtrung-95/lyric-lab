"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { buildChoices, buildCloze } from "@/lib/practice/cloze";

/**
 * Luyện từ này: điền từ vào chỗ trống của một câu thật (đáp án nhiễu là từ HSK cùng cấp), cộng lối vào Khám phá nếu từ có trong một cảnh.
 * Chỉ để tự kiểm tra, không tính điểm/XP (mục "Ôn" cho thẻ lưu có điểm riêng).
 */
export function WordPractice({ term, examples, pool, scene }: { term: string; examples: ExampleSentence[]; pool: string[]; scene: { id: string; title: string } | null }) {
  const usable = useMemo(() => examples.filter((e) => buildCloze(term, e.text)), [examples, term]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const ex = usable.length ? usable[round % usable.length] : null;
  // Đáp án xáo một lần cho mỗi vòng (khóa theo `round`); Math.random chỉ chạy ở client khi bấm sang vòng mới nên không lệch với bản dựng trên server.
  const choices = useMemo(() => (ex ? buildChoices(term, pool, ex.text) : []), [ex, pool, term, round]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ex && !scene) return null;
  const cloze = ex ? buildCloze(term, ex.text) : null;
  const done = picked !== null;

  return (
    <section aria-label="Luyện từ này" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Luyện từ này</h2>
      {ex && cloze && choices.length > 1 && (
        <div className="space-y-space-sm">
          <p className="text-body-md text-on-surface-variant">Chọn từ điền vào chỗ trống:</p>
          <p lang="zh-Hans" className="font-serif text-headline-md">{cloze.before}<span className="mx-1 inline-block min-w-12 border-b-4 border-primary text-center text-primary">{done ? term : "＿＿"}</span>{cloze.after}</p>
          <p className="text-body-md text-on-surface-variant">{ex.translation}</p>
          <div role="group" aria-label="Đáp án" className="grid grid-cols-2 gap-2">
            {choices.map((c) => {
              const right = c === term;
              const state = !done ? "bg-surface-container-lowest" : right ? "bg-secondary-container text-on-secondary-container" : c === picked ? "bg-error-container text-on-error-container" : "bg-surface-container-lowest opacity-60";
              return <button key={c} type="button" lang="zh-Hans" disabled={done} onClick={() => setPicked(c)} className={`min-h-12 rounded-2xl border-2 border-ink px-3 font-serif text-xl font-bold ${state}`}>{c}</button>;
            })}
          </div>
          {done && (
            <div role="status" className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{picked === term ? "Chính xác!" : `Chưa đúng, đáp án là ${term}.`}</span>
              <PronounceButton text={ex.text} className="size-11" />
              <button type="button" onClick={() => { setPicked(null); setRound((r) => r + 1); }} className="btn-3d btn-3d-primary min-h-11 px-4 text-label-md font-extrabold">Câu khác</button>
            </div>
          )}
        </div>
      )}
      {scene && (
        <Link href={`/kham-pha/${scene.id}`} className="inline-flex min-h-11 items-center gap-1 text-label-md font-extrabold text-primary hover:underline"><Icon name="school" size={20} /> Học trong Khám phá: {scene.title}</Link>
      )}
    </section>
  );
}
