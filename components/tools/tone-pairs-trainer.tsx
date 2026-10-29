"use client";

import { useState } from "react";
import { playSfx } from "@/lib/feedback/sfx";
import { ToneContourChart } from "@/components/pronunciation/tone-contour-chart";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { TONES } from "@/lib/pronunciation/tone-data";
import { buildPairQuiz, pairLabel, TONE_PAIRS, type PairQuestion, type PairTone, type TonePair } from "@/lib/tools/tone-pairs";

const SECOND: PairTone[] = [1, 2, 3, 4, 5];
const toneName = (t: PairTone) => (t === 5 ? "nhẹ" : String(t));
const cell = (on: boolean) => `min-h-14 rounded-xl border-2 px-2 py-1 text-center transition-colors ${on ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`;

/** Bảng bốn thanh, bảng 20 cặp thanh (chạm để nghe từ mẫu) và trò nghe đoán cặp thanh. */
export function TonePairsTrainer() {
  const [selected, setSelected] = useState<TonePair>(TONE_PAIRS[0]);
  const [quiz, setQuiz] = useState<PairQuestion[] | null>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const q = quiz && step < quiz.length ? quiz[step] : null;
  function start() { setQuiz(buildPairQuiz(8)); setStep(0); setPicked(null); setScore(0); }
  function answer(option: string) {
    if (!q || picked) return;
    setPicked(option);
    const right = option === pairLabel(q.pair);
    if (right) setScore((s) => s + 1);
    playSfx(right ? "correct" : "wrong");
  }

  return (
    <div className="space-y-space-lg">
      <section aria-labelledby="tones-heading">
        <h2 id="tones-heading" className="font-serif text-headline-md">Bốn thanh điệu</h2>
        <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {TONES.map((t) => (
            <li key={t.id} className="card-ink space-y-1 p-space-sm">
              <p className="flex items-center gap-2"><span className="text-body-lg font-bold text-on-surface">{t.name}</span><span className="text-label-md text-primary">{t.chao} · {t.shape}</span></p>
              <ToneContourChart tone={t.id} />
              <p className="flex items-center gap-2"><span lang="zh" className="font-serif text-headline-md">{t.example.han}</span><span className="text-body-md text-primary">{t.example.pinyin}</span><PronounceButton text={t.example.han} className="size-9" /></p>
              <p className="text-body-sm text-on-surface-variant">{t.vietnamese}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pairs-heading" className="space-y-space-sm">
        <h2 id="pairs-heading" className="font-serif text-headline-md">20 cặp thanh điệu</h2>
        <p className="text-body-md text-on-surface-variant">Hàng là thanh của âm tiết đầu, cột là thanh của âm tiết sau (5 là thanh nhẹ). Chạm một ô để nghe từ mẫu.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-separate border-spacing-1.5">
            <caption className="sr-only">Bảng 20 cặp thanh điệu</caption>
            <thead><tr><th scope="col" className="text-label-md text-on-surface-variant">Đầu ↓ Sau →</th>{SECOND.map((s) => <th key={s} scope="col" className="text-label-md font-semibold text-on-surface-variant">Thanh {toneName(s)}</th>)}</tr></thead>
            <tbody>
              {([1, 2, 3, 4] as const).map((f) => (
                <tr key={f}>
                  <th scope="row" className="text-label-md font-semibold text-on-surface-variant">Thanh {f}</th>
                  {SECOND.map((s) => {
                    const p = TONE_PAIRS.find((x) => x.first === f && x.second === s)!;
                    return <td key={s}><button type="button" aria-pressed={selected === p} onClick={() => setSelected(p)} className={`${cell(selected === p)} w-full`}><span lang="zh" className="block font-serif text-body-lg">{p.han}</span><span className="block text-label-sm">{p.pinyin}</span></button></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div role="status" className="card-ink flex items-start gap-3 p-space-sm">
          <div className="min-w-0 flex-1">
            <p className="text-label-md font-semibold text-primary">Cặp {pairLabel(selected)}: thanh {selected.first} + thanh {toneName(selected.second)}</p>
            <p className="flex flex-wrap items-baseline gap-x-2"><span lang="zh" className="font-serif text-headline-md">{selected.han}</span><span className="text-body-lg text-primary">{selected.pinyin}</span><span className="text-body-md text-on-surface">{selected.vi}</span></p>
            {selected.note && <p className="mt-1 text-body-md text-on-surface-variant">{selected.note}</p>}
          </div>
          <PronounceButton text={selected.han} className="size-11" />
        </div>
      </section>

      <section aria-labelledby="pair-quiz-heading" className="card-ink space-y-3 p-space-md">
        <h2 id="pair-quiz-heading" className="font-serif text-headline-md">Thử nghe đoán cặp thanh</h2>
        {!quiz && (<><p className="text-body-md text-on-surface-variant">Nghe một từ hai âm tiết rồi chọn đúng cặp thanh (ví dụ 1-4 là thanh 1 rồi thanh 4). 8 câu.</p><button type="button" onClick={start} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110">Bắt đầu</button></>)}
        {q && quiz && (
          <div className="space-y-3">
            <p className="text-label-md text-on-surface-variant">Câu {step + 1}/{quiz.length}</p>
            <p className="flex items-center gap-3 text-body-lg text-on-surface">Nghe từ này: <PronounceButton text={q.pair.han} className="size-12" /></p>
            <div role="group" aria-label="Chọn cặp thanh" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {q.options.map((o) => {
                const right = o === pairLabel(q.pair);
                const cls = !picked ? "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high" : right ? "border-primary bg-primary-container text-on-primary-container" : o === picked ? "border-error bg-error-container text-on-error-container" : "border-outline-variant bg-surface-container-lowest opacity-60";
                return <button key={o} type="button" disabled={!!picked} onClick={() => answer(o)} className={`min-h-12 rounded-xl border-2 px-3 text-body-lg font-semibold ${cls}`}>{o}</button>;
              })}
            </div>
            {picked && (
              <div role="status" className="space-y-2">
                <p className={`text-body-md font-medium ${picked === pairLabel(q.pair) ? "text-primary" : "text-error"}`}>{picked === pairLabel(q.pair) ? "Đúng rồi!" : `Chưa đúng. Đáp án là ${pairLabel(q.pair)}.`}</p>
                <p className="text-body-md text-on-surface-variant"><span lang="zh" className="font-serif text-body-lg">{q.pair.han}</span> {q.pair.pinyin}: {q.pair.vi}.</p>
                <button type="button" onClick={() => { if (step + 1 >= quiz.length && score * 2 >= quiz.length) playSfx("complete"); setPicked(null); setStep((s) => s + 1); }} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110">{step + 1 < quiz.length ? "Câu tiếp" : "Xem kết quả"}</button>
              </div>
            )}
          </div>
        )}
        {quiz && !q && (
          <div role="status" className="space-y-3">
            <p className="text-headline-md font-bold text-on-surface">{score}/{quiz.length} câu đúng</p>
            <button type="button" onClick={start} className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-6 text-label-md font-semibold text-primary hover:bg-surface-container-high">Chơi lại</button>
          </div>
        )}
      </section>
    </div>
  );
}
