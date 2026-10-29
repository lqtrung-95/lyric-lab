"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RubyLine } from "@/components/ui/ruby-text";
import type { LevelBand } from "@/lib/dialogues/dialogue-types";
import { playChinese, playChineseSequence, stopChinese } from "@/lib/speech/play-chinese";
import type { ReadingDef } from "@/lib/readings/reading-types";

const chip = "inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold";

/**
 * Trình đọc một truyện ngắn: chữ Hán có pinyin (từ từ điển), nghe từng câu hoặc cả bài, bật/tắt nghĩa Việt, rồi câu hỏi đọc hiểu.
 * Nghĩa Việt ẩn mặc định để người học tự đoán trước; bấm "Nghĩa" ở từng câu để xem riêng câu đó.
 */
export function ReadingPlayer({ reading, pinyin, level }: { reading: ReadingDef; pinyin: Record<string, string>; level: LevelBand | null }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showAllVi, setShowAllVi] = useState(false);
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());
  const [reading_, setReadingIdx] = useState(-1);
  useEffect(() => () => stopChinese(), []);

  const toggle = (i: number) => setOpen((o) => { const n = new Set(o); if (!n.delete(i)) n.add(i); return n; });
  const playAll = () => {
    if (reading_ >= 0) { stopChinese(); return; }
    void playChineseSequence(reading.sentences.map((s) => s.zh), setReadingIdx);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <Link href="/readings" className="inline-flex min-h-11 w-fit items-center text-label-md font-bold underline">← Tất cả truyện</Link>
      <header>
        <h1 lang="zh-Hans" className="font-serif text-headline-lg"><span aria-hidden="true">{reading.emoji}</span> {reading.title.zh}</h1>
        <p className="text-body-md text-on-surface-variant">{reading.title.vi}{level ? ` · HSK ${level >= 6 ? "6+" : level}` : ""}</p>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tùy chọn đọc">
        <button type="button" onClick={playAll} className={`${chip} bg-primary-container text-on-primary-container`}>{reading_ >= 0 ? "Dừng" : "Nghe cả bài"}</button>
        <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={`${chip} ${showPinyin ? "bg-secondary-container" : "bg-surface-container-lowest"}`}>Pinyin</button>
        <button type="button" aria-pressed={showAllVi} onClick={() => setShowAllVi((v) => !v)} className={`${chip} ${showAllVi ? "bg-secondary-container" : "bg-surface-container-lowest"}`}>Nghĩa Việt</button>
      </div>
      <ol className="flex flex-col gap-2">
        {reading.sentences.map((s, i) => {
          const vi = showAllVi || open.has(i);
          return (
            <li key={i} className={`card-ink p-space-sm ${i === reading_ ? "bg-primary-container" : ""}`} aria-current={i === reading_ ? "true" : undefined}>
              <p lang="zh-Hans" className="text-body-lg font-bold leading-[2.1]"><RubyLine zh={s.zh} pinyin={pinyin[s.zh]} show={showPinyin} /></p>
              {vi && <p className="text-body-md text-on-surface-variant">{s.vi}</p>}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => { stopChinese(); void playChinese(s.zh); }} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">Nghe</button>
                {!showAllVi && <button type="button" aria-pressed={open.has(i)} onClick={() => toggle(i)} className="min-h-11 rounded-full px-3 text-label-md font-bold underline">{open.has(i) ? "Ẩn nghĩa" : "Nghĩa"}</button>}
                {i === reading_ && <span className="text-label-md font-extrabold">đang đọc</span>}
              </div>
            </li>
          );
        })}
      </ol>
      <Quiz reading={reading} />
    </div>
  );
}

/** Câu hỏi đọc hiểu (đề bằng tiếng Việt): chọn một đáp án, có phản hồi ngay bằng chữ (không chỉ màu) và có thể làm lại. */
function Quiz({ reading }: { reading: ReadingDef }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => reading.quiz.map(() => null));
  const done = picked.every((p) => p !== null);
  const right = picked.filter((p, i) => p === reading.quiz[i].answer).length;
  return (
    <section aria-label="Đọc hiểu" className="card-ink flex flex-col gap-space-sm p-space-md">
      <h2 className="text-headline-md">Bạn hiểu bao nhiêu?</h2>
      {reading.quiz.map((q, qi) => (
        <fieldset key={qi} className="flex flex-col gap-2">
          <legend className="text-label-lg font-extrabold">{qi + 1}. {q.q}</legend>
          {q.options.map((o, oi) => {
            const sel = picked[qi] === oi;
            const reveal = picked[qi] !== null;
            const correct = oi === q.answer;
            return (
              <button key={oi} type="button" disabled={reveal} aria-pressed={sel} onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                className={`min-h-11 rounded-xl border-2 px-3 text-left text-body-md ${reveal && correct ? "border-ink bg-secondary-container font-bold" : sel ? "border-ink bg-error-container" : "border-outline-variant bg-surface-container-lowest"}`}>
                {o}{reveal && correct ? " ✓ đúng" : reveal && sel ? " ✗ chưa đúng" : ""}
              </button>
            );
          })}
        </fieldset>
      ))}
      {done && (
        <div role="status" className="flex flex-wrap items-center gap-3">
          <p className="text-label-lg font-extrabold">{right}/{reading.quiz.length} câu đúng{right === reading.quiz.length ? ". Bạn hiểu rất tốt!" : ". Đọc lại truyện rồi thử lần nữa nhé."}</p>
          <button type="button" onClick={() => setPicked(reading.quiz.map(() => null))} className={`${chip} bg-surface-container-lowest`}>Làm lại</button>
        </div>
      )}
    </section>
  );
}
