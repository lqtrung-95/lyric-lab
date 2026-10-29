"use client";

import { useMemo, useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { sfx } from "@/lib/games/arcade-sfx";
import { PET_TAUGHT_EVENT, PET_TAUGHT_KEY, TEACH_ROUND, applyTeach, candidatesFromSaved, forgottenWords, nextTeachQuestion, parseTaught, type TaughtWord, type TeachQuestion } from "@/lib/pet/pet-teach";
import { playChinese } from "@/lib/speech/play-chinese";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { PetTeachBook } from "./pet-teach-book";
import { useLocalJson } from "./use-local-json-store";

const NO_TAUGHT: TaughtWord[] = [];

/** Sổ từ pet đã học (lưu ở thiết bị này) và số từ pet đang quên, cho thẻ pet nhắc dạy lại. */
export function usePetTaught() {
  const [taught, setTaught] = useLocalJson(PET_TAUGHT_KEY, PET_TAUGHT_EVENT, parseTaught, NO_TAUGHT);
  return { taught, setTaught };
}

/** Số từ pet đang quên tại thời điểm `now`. */
export const forgottenCount = (taught: readonly TaughtWord[], now: number): number => forgottenWords(taught, now).length;

type Step = { kind: "intro" } | { kind: "ask"; q: TeachQuestion; picked: number | null } | { kind: "summary" };

/**
 * Dạy pet: pet "chưa biết" một từ trong bộ thẻ của bạn, bạn chọn nghĩa đúng để dạy (cùng từ lần sau thì pet nhớ lâu hơn, bỏ lâu thì pet quên).
 * Mỗi lần tối đa `TEACH_ROUND` từ. Không ghi XP và không đổi lịch ôn FSRS: chỉ là cách ôn vui. `onReact` để thẻ pet nổ hiệu ứng.
 */
export function PetTeach({ name, onReact, onClose }: { name: string; onReact: (kind: "cheer" | "try") => void; onClose: () => void }) {
  const { state } = useLearnerState();
  const { taught, setTaught } = usePetTaught();
  const pool = useMemo(() => candidatesFromSaved(state.saved), [state.saved]);
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [asked, setAsked] = useState<string[]>([]);
  const [right, setRight] = useState(0);
  // Mốc thời gian chốt ở lúc bấm (không đọc đồng hồ khi vẽ); sổ từ vẽ theo mốc này.
  const [now, setNow] = useState(0);

  const ask = (skip: string[]) => {
    const t = Date.now();
    setNow(t);
    const q = nextTeachQuestion(pool, taught, new Set(skip), t, t);
    setStep(q ? { kind: "ask", q, picked: null } : { kind: "summary" });
  };
  const start = () => { sfx.petBlip(); setAsked([]); setRight(0); ask([]); };
  const pick = (i: number) => {
    if (step.kind !== "ask" || step.picked !== null) return;
    const ok = i === step.q.answer;
    if (ok) { setTaught(applyTeach(taught, step.q.word, now)); setRight((n) => n + 1); }
    onReact(ok ? "cheer" : "try");
    setStep({ ...step, picked: i });
  };
  const next = () => {
    if (step.kind !== "ask") return;
    const skip = [...asked, step.q.word.term];
    setAsked(skip);
    if (skip.length >= TEACH_ROUND) { setNow(Date.now()); setStep({ kind: "summary" }); } else ask(skip);
  };

  let body;
  if (pool.length < 3 && step.kind === "intro") {
    body = <p className="text-body-md">Lưu vài từ có nghĩa vào bộ ôn (ít nhất 3 từ, nghĩa khác nhau) rồi quay lại dạy {name} nhé.</p>;
  } else if (step.kind === "intro") {
    body = (
      <>
        <p className="text-body-md">{name} chưa biết mấy từ này. Bạn chọn nghĩa đúng để dạy {name} nhé ({TEACH_ROUND} từ mỗi lần).</p>
        <Button3d type="button" variant="bright" className="mt-2" onClick={start}>Bắt đầu dạy</Button3d>
      </>
    );
  } else if (step.kind === "ask") {
    const { q, picked } = step;
    const done = picked !== null;
    body = (
      <>
        <p className="text-label-md text-on-surface-variant">Từ {Math.min(asked.length + 1, TEACH_ROUND)}/{TEACH_ROUND}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3">
          <span lang="zh" className="font-serif text-hanzi-display">{q.word.term}</span>
          {q.word.pinyin && <span className="text-pinyin-reading text-primary">{q.word.pinyin}</span>}
          <button type="button" onClick={() => void playChinese(q.word.term)} className="min-h-11 rounded-full px-3 text-label-md font-bold text-secondary hover:bg-surface-container">Nghe</button>
        </div>
        <p className="mt-1 text-body-md font-medium">{name} hỏi: từ này nghĩa là gì vậy?</p>
        <div className="mt-2 flex flex-col gap-2" role="group" aria-label="Chọn nghĩa đúng">
          {q.options.map((o, i) => (
            <button key={o} type="button" disabled={done} onClick={() => pick(i)} aria-pressed={picked === i}
              className={`min-h-11 rounded-xl border-2 px-3 text-left text-body-md font-bold ${done && i === q.answer ? "border-secondary bg-secondary-container" : "border-ink bg-surface-container-lowest"} ${picked === i && i !== q.answer ? "border-dashed opacity-70" : ""}`}>
              {done && i === q.answer ? "✓ " : picked === i ? "✗ " : ""}{o}
            </button>
          ))}
        </div>
        {done && (
          <div role="status" className="mt-2">
            <p className="text-body-md font-bold">{picked === q.answer ? `${name} nhớ rồi! Cảm ơn bạn đã dạy.` : `Ôi, nghĩa đúng là "${q.word.meaning}". ${name} sẽ hỏi lại từ này sau nhé.`}</p>
            <Button3d type="button" variant="bright" className="mt-2" onClick={next}>{asked.length + 1 >= TEACH_ROUND ? "Xong" : "Từ tiếp theo"}</Button3d>
          </div>
        )}
      </>
    );
  } else {
    body = <p role="status" className="text-body-md font-bold text-secondary">{right > 0 ? `${name} học thêm được ${right} từ. Giỏi quá, thầy giáo nhí!` : `${name} chưa nhớ thêm từ nào. Lần sau mình dạy lại nhé.`}</p>;
  }

  return (
    <div className="basis-full rounded-2xl bg-surface-container-low p-space-sm" role="group" aria-label={`Dạy ${name}`}>
      {body}
      {(step.kind === "intro" || step.kind === "summary") && <PetTeachBook name={name} words={taught} now={now || taught.reduce((m, w) => Math.max(m, w.lastAt), 0)} />}
      <button type="button" onClick={onClose} className="cursor-pointer mt-2 min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">{step.kind === "summary" ? "Xong" : "Để lúc khác"}</button>
    </div>
  );
}
