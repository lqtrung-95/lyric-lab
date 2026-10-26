"use client";

import { useMemo, useRef, useState } from "react";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import { Button3d } from "@/components/ui/button-3d";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { buildCloze, segmentLine, type ClozeItem } from "@/lib/explore/scene-stories/segment-and-cloze";
import type { SceneStory } from "@/lib/explore/scene-stories/story-types";
import type { SceneWord } from "@/lib/explore/explore-types";
import { answerPoints } from "@/lib/practice/scoring";
import { submitRoundScore } from "@/lib/practice/submit-score";
import type { ObjectMark } from "./scene-canvas";

interface Props {
  story: SceneStory;
  words: SceneWord[];
  marks: Record<string, ObjectMark>;
  /** Câu tiếng Trung → pinyin (từ từ điển). */
  pinyin: Record<string, string>;
  onPickWord: (w: SceneWord) => void;
  /** Báo dùng đúng một từ trong ngữ cảnh (làm từ đó "sáng" lại trong tiến độ). */
  onUseWord: (id: string, ok: boolean) => void;
}

/** Gửi điểm một lượt bài tập sau truyện như một lượt nhiệm vụ Khám phá (tính XP, chuỗi ngày, nhiệm vụ ngày). */
function submitStoryScore(correct: number, total: number, startedAt: number): void {
  const durationSec = Math.max(total * 2, (Date.now() - startedAt) / 1000);
  void submitRoundScore("explore", { points: correct * answerPoints("correct", 0), correct, total, durationSec }).then((ok) => { if (ok) refreshGameSummary(); });
}

type Question = { kind: "read"; vi: string; before: string; answer: string; after: string; options: string[] } | { kind: "cloze"; item: ClozeItem };

/**
 * "Câu chuyện của cảnh": một truyện ngắn dùng chính các từ vừa học (từ nào cũng bấm được để xem thẻ từ, bấm loa nghe từng câu),
 * kèm bài làm sau khi đọc: một câu hỏi hiểu bài và bốn câu điền từ khoét từ chính truyện. Đúng ngay lần đầu thì từ được tính là đã dùng trong ngữ cảnh và nhận XP như một lượt nhiệm vụ.
 */
export function SceneStoryCard({ story, words, marks, pinyin, onPickWord, onUseWord }: Props) {
  const [showPinyin, setShowPinyin] = useState(false);
  const [showVi, setShowVi] = useState(true);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [step, setStep] = useState(0);
  const [wrongTried, setWrongTried] = useState<string[]>([]);
  const [firstTry, setFirstTry] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(0);
  const byTerm = useMemo(() => Object.fromEntries(words.map((w) => [w.term, w])) as Record<string, SceneWord>, [words]);
  const terms = useMemo(() => words.map((w) => w.term), [words]);

  function start() {
    const shuffled = [story.question.right, ...story.question.wrong].sort(() => Math.random() - 0.5);
    const cloze = buildCloze(story.lines, terms);
    setQuiz([
      { kind: "read", vi: story.question.vi, before: "", answer: story.question.right, after: "", options: shuffled },
      ...cloze.map((item): Question => ({ kind: "cloze", item })),
    ]);
    setStep(0);
    setWrongTried([]);
    setFirstTry(0);
    setDone(false);
    started.current = Date.now();
  }

  function choose(q: Question, option: string) {
    const answer = q.kind === "read" ? q.answer : q.item.answer;
    if (option !== answer) { setWrongTried((cur) => [...cur, option]); return; }
    const clean = wrongTried.length === 0;
    // Chỉ làm sáng lại từ đã học (không tự đánh dấu "đã học" cho từ người chơi chưa mở).
    const w = q.kind === "cloze" ? byTerm[answer] : undefined;
    if (w && marks[w.id] !== "new") onUseWord(w.id, clean);
    const nextFirst = firstTry + (clean ? 1 : 0);
    setFirstTry(nextFirst);
    setWrongTried([]);
    if (quiz && step + 1 < quiz.length) { setStep(step + 1); return; }
    setDone(true);
    submitStoryScore(nextFirst, quiz?.length ?? 1, started.current);
  }

  const toggleCls = (on: boolean) => `min-h-9 rounded-full border-2 border-ink px-3 text-label-md font-extrabold ${on ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest text-on-surface-variant"}`;
  const q = quiz && !done ? quiz[step] : null;

  return (
    <section aria-label="Câu chuyện của cảnh" className="card-ink flex flex-col gap-space-sm p-space-md">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-label-md font-extrabold text-primary">📖 Câu chuyện của cảnh</p>
          <h2 lang="zh-Hans" className="text-headline-md">{story.title.zh}</h2>
          {showVi && <p className="text-body-sm text-on-surface-variant">{story.title.vi}</p>}
        </div>
        <div role="group" aria-label="Gợi ý" className="flex gap-1.5">
          <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={toggleCls(showPinyin)}>Pinyin</button>
          <button type="button" aria-pressed={showVi} onClick={() => setShowVi((v) => !v)} className={toggleCls(showVi)}>Nghĩa</button>
        </div>
      </header>

      <ol className="flex flex-col gap-2">
        {story.lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-lowest px-space-sm py-2">
            <div className="min-w-0 flex-1">
              <p lang="zh-Hans" className="text-body-lg font-bold leading-relaxed">
                {segmentLine(line.zh, terms).map((s, j) => {
                  if (!s.term) return <span key={j}>{s.text}</span>;
                  const w = byTerm[s.term];
                  const known = w && marks[w.id] !== "new";
                  return (
                    <button key={j} type="button" onClick={() => w && onPickWord(w)} title={w?.gloss}
                      className={`rounded px-0.5 font-extrabold underline decoration-2 underline-offset-4 ${known ? "bg-primary-container/60 text-on-primary-container decoration-primary" : "text-on-surface-variant decoration-dashed decoration-outline"}`}>
                      {s.text}
                    </button>
                  );
                })}
              </p>
              {showPinyin && pinyin[line.zh] && <p className="text-body-sm text-primary">{pinyin[line.zh]}</p>}
              {showVi && <p className="text-body-sm text-on-surface-variant">{line.vi}</p>}
            </div>
            <PronounceButton text={line.zh} className="size-9" />
          </li>
        ))}
      </ol>
      <p className="text-label-md text-on-surface-variant">Từ gạch chân là từ của cảnh: bấm để xem thẻ từ. Từ gạch đứt là từ bạn chưa học.</p>

      {!quiz && <Button3d variant="secondary" onClick={start}>Làm bài sau khi đọc (hiểu bài + điền từ)</Button3d>}

      {q && (
        <div role="group" aria-label="Bài tập" className="flex flex-col gap-2 rounded-2xl border-2 border-ink bg-surface-container-low p-space-sm">
          <p className="text-label-md font-extrabold text-on-surface-variant">Câu {step + 1}/{quiz!.length}</p>
          {q.kind === "read" ? (
            <p className="text-body-lg font-bold">{q.vi}</p>
          ) : (
            <p lang="zh-Hans" className="text-headline-md font-bold">{q.item.before}<span className="mx-1 inline-block min-w-14 rounded-lg border-2 border-dashed border-ink bg-surface-container-lowest px-2 text-center text-on-surface-variant">＿＿</span>{q.item.after}</p>
          )}
          {q.kind === "cloze" && showVi && <p className="text-body-sm text-on-surface-variant">{story.lines[q.item.lineIndex].vi}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {(q.kind === "read" ? q.options : q.item.options).map((o) => {
              const wrong = wrongTried.includes(o);
              return (
                <button key={o} type="button" disabled={wrong} onClick={() => choose(q, o)} lang="zh-Hans"
                  className={`min-h-11 rounded-xl border-2 px-3 py-2 text-left text-body-lg font-bold ${wrong ? "border-error bg-error-container text-on-error-container line-through opacity-70" : "border-ink bg-surface-container-lowest hover:bg-primary-container"}`}>
                  {o}
                </button>
              );
            })}
          </div>
          {wrongTried.length > 0 && <p role="status" className="text-label-md font-bold text-error">Chưa đúng, thử đáp án khác nhé.</p>}
        </div>
      )}

      {done && quiz && (
        <div role="status" className="flex flex-col gap-2 rounded-2xl border-2 border-ink bg-secondary-container p-space-sm text-on-secondary-container">
          <p className="text-headline-md font-extrabold">🎉 Xong! {firstTry}/{quiz.length} câu đúng ngay lần đầu</p>
          <p className="text-body-md">Các từ bạn điền đúng đã sáng lại trong tiến độ, và lượt làm này được tính XP như một lượt nhiệm vụ.</p>
          <Button3d variant="primary" onClick={start}>Làm lại với câu khác</Button3d>
        </div>
      )}
    </section>
  );
}
