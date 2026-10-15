"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { TONES, type ToneId } from "@/lib/pronunciation/tone-data";
import { buildToneQuiz, type ToneQuestion } from "@/lib/pronunciation/tone-quiz";
import { playChinese } from "@/lib/speech/play-chinese";

const TONE_IDS: ToneId[] = [1, 2, 3, 4];
const ROUNDS = 8;

/** Trò nghe đoán thanh: nghe một âm tiết rồi chọn thanh 1–4. Chỉ cần loa, không cần micro. `onFinish` được gọi khi làm hết các câu. */
export function ToneQuizGame({ rounds = ROUNDS, onFinish }: { rounds?: number; onFinish?: (score: number, total: number) => void } = {}) {
  const [questions, setQuestions] = useState<ToneQuestion[]>(() => buildToneQuiz(rounds));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<ToneId | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= questions.length;
  const q = questions[i];
  useEffect(() => { if (done) onFinish?.(score, questions.length); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps -- báo đúng một lần khi xong

  function answer(t: ToneId) {
    if (picked !== null) return;
    setPicked(t);
    if (t === q.answer) setScore((s) => s + 1);
  }
  function next() { setI((n) => n + 1); setPicked(null); }
  function restart() { setQuestions(buildToneQuiz(rounds)); setI(0); setPicked(null); setScore(0); }

  if (done) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-lg text-center" data-testid="quiz-done">
        <p className="font-serif text-headline-lg">{score}/{questions.length}</p>
        <p className="mt-1 text-body-lg text-on-surface-variant">{score >= 7 ? "Tai bạn bắt thanh rất tốt!" : score >= 5 ? "Khá rồi, nghe thêm vài lượt nữa là chắc." : "Thanh điệu cần tập nghe nhiều. Thử lại sau khi xem phần mô tả từng thanh."}</p>
        <button type="button" onClick={restart} className="mt-space-md inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary"><Icon name="replay" size={20} /> Chơi lại</button>
      </div>
    );
  }
  return (
    <div className="space-y-space-md">
      <p className="text-body-md text-on-surface-variant" aria-live="polite">Câu {i + 1}/{questions.length} · đúng {score}</p>
      <button type="button" onClick={() => void playChinese(q.han)} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary">
        <Icon name="volume_up" size={24} filled /> Nghe âm tiết
      </button>
      <div role="group" aria-label="Đây là thanh nào?" className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
        {TONE_IDS.map((t) => {
          const state = picked === null ? "" : t === q.answer ? "border-primary bg-primary-container" : t === picked ? "border-error bg-error-container" : "opacity-60";
          return (
            <button key={t} type="button" onClick={() => answer(t)} disabled={picked !== null} className={`min-h-16 rounded-xl border border-outline-variant px-2 text-label-md font-medium ${state}`}>
              <span className="block text-body-lg">Thanh {t}</span>
              <span className="block text-body-sm text-on-surface-variant">{TONES[t - 1].shape}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div role="status" className="space-y-space-sm">
          <p className="text-body-lg">{picked === q.answer ? "Chính xác!" : `Chưa đúng, đáp án là thanh ${q.answer}.`} <span lang="zh-Hans" className="font-serif">{q.han}</span> đọc là <strong>{q.pinyin}</strong>.</p>
          <button type="button" onClick={next} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container">{i + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp"} <Icon name="arrow_forward" size={20} /></button>
        </div>
      )}
    </div>
  );
}
