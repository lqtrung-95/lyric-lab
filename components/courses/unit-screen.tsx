"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PASS_PERCENT, REVIEW_QUIZ_KINDS, UNIT_QUIZ_KINDS } from "@/lib/courses/build-unit-quiz";
import type { UnitProgress } from "@/lib/courses/course-types";
import { listUnitProgress, saveUnitProgress } from "@/lib/user-data/unit-progress-repo";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { savedItemFor, UnitLearnStep } from "./unit-learn-step";
import { UnitListenStep } from "./unit-listen-step";
import { UnitQuizStep } from "./unit-quiz-step";
import { useUnit } from "./use-unit";

type Step = "learn" | "listen" | "quiz" | "result";
const STEPS: { id: Exclude<Step, "result">; label: string }[] = [
  { id: "learn", label: "1. Làm quen" },
  { id: "listen", label: "2. Nghe câu thật" },
  { id: "quiz", label: "3. Kiểm tra" },
];

/**
 * Màn một chặng của lộ trình: chặng học là làm quen từ → nghe trong câu thật → kiểm tra; chặng ôn tổng hợp (ôn nhóm chặng, kiểm tra cuối cấp) chỉ có bài kiểm tra.
 * Kết quả lưu vào tiến độ (điểm cao nhất, hoàn thành từ 70%); từ làm sai (có câu thật làm nguồn) tự vào bộ thẻ ôn.
 */
export function UnitScreen({ slug, idx }: { slug: string; idx: number }) {
  const unit = useUnit(slug, idx);
  const [step, setStep] = useState<Step>("learn");
  const [result, setResult] = useState<{ percent: number; passed: boolean; saved: boolean; added: number; missed: number } | null>(null);
  const { state: learner, toggleSaved } = useLearnerState();
  const [prev, setPrev] = useState<UnitProgress | undefined>();
  const unitId = unit.status === "ready" ? unit.detail.unit.id : null;

  useEffect(() => {
    if (!unitId) return;
    let cancelled = false;
    void listUnitProgress().then((all) => { if (!cancelled) setPrev(all.find((p) => p.unitId === unitId)); });
    return () => { cancelled = true; };
  }, [unitId]);

  if (unit.status === "loading") return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải chặng…</p>;
  if (unit.status === "not_found") return <p className="py-space-lg text-body-md">Không có chặng này. <Link href={`/hoc?khoa=${slug}`} className="text-primary underline">Về lộ trình</Link></p>;
  if (unit.status === "error") return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được chặng. Kiểm tra kết nối rồi tải lại trang nhé.</p>;

  const { detail } = unit;
  const hasNext = detail.unit.idx < detail.unit.total;

  const isReview = detail.unit.kind !== "hsk";

  async function finish(percent: number, passed: boolean, wrongTerms: string[]) {
    const saved = await saveUnitProgress(detail.unit.id, prev, { status: passed ? "completed" : "in_progress", score: percent });
    // Từ làm sai vào bộ ôn (thẻ ôn cần câu thật làm nguồn nên từ chưa có câu thì chỉ đếm là "chưa lưu được").
    const have = new Set(learner.saved.map((x) => x.key));
    const items = wrongTerms.map((t) => detail.words.find((w) => w.term === t)).map((w) => (w ? savedItemFor(w) : null));
    const fresh = items.filter((x): x is NonNullable<typeof x> => x !== null && !have.has(x.key));
    fresh.forEach((x) => toggleSaved(x));
    setResult({ percent, passed, saved, added: fresh.length, missed: items.filter((x) => x === null).length });
    setStep("result");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <Link href={`/hoc?khoa=${slug}`} className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} /> Lộ trình {detail.course.title}</Link>
      <header>
        <p className="text-label-md text-on-surface-variant">{detail.unit.kind === "final" ? "Kiểm tra cuối cấp" : detail.unit.kind === "checkpoint" ? "Ôn tập" : "Chặng"} {detail.unit.idx}/{detail.unit.total}</p>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{detail.unit.title}</h1>
      </header>
      {isReview && step === "learn" && (
        <div className="card-ink p-space-md">
          <p className="text-body-lg">{detail.unit.kind === "final" ? `Bài kiểm tra tổng hợp ${detail.unit.quizLength} câu từ toàn bộ ${detail.course.title}.` : `${detail.unit.quizLength} câu ôn lại các từ của nhóm chặng vừa học.`} Đạt từ {PASS_PERCENT}% là hoàn thành.</p>
          <p className="mt-1 text-body-md text-on-surface-variant">Từ làm sai sẽ tự vào bộ thẻ ôn để bạn ôn lại đúng lúc.</p>
          <button type="button" onClick={() => setStep("quiz")} className="btn-3d btn-3d-bright mt-space-md">Bắt đầu làm bài <Icon name="arrow_forward" size={20} /></button>
        </div>
      )}
      {!isReview && step !== "result" && (
        <ol className="flex gap-1 rounded-full bg-surface-container p-1" aria-label="Các bước">
          {STEPS.map((s) => <li key={s.id} aria-current={step === s.id ? "step" : undefined} className={`flex-1 rounded-full px-2 py-2 text-center text-label-md ${step === s.id ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>{s.label}</li>)}
        </ol>
      )}
      {!isReview && step === "learn" && <UnitLearnStep words={detail.words} onNext={() => setStep("listen")} />}
      {step === "listen" && <UnitListenStep words={detail.words} onNext={() => setStep("quiz")} />}
      {step === "quiz" && <UnitQuizStep words={detail.words} length={detail.unit.quizLength} kinds={isReview ? REVIEW_QUIZ_KINDS : UNIT_QUIZ_KINDS} onFinish={(p, ok, wrong) => void finish(p, ok, wrong)} />}
      {step === "result" && result && (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-lg text-center" data-testid="unit-result">
          <p className="font-serif text-headline-lg">{result.percent}%</p>
          <p className="mt-1 text-body-lg">{result.passed ? (detail.unit.kind === "final" ? `Hoàn thành ${detail.course.title}! Giỏi lắm.` : isReview ? "Ôn tập xong! Giỏi lắm." : "Hoàn thành chặng! Giỏi lắm.") : `Chưa đạt ${PASS_PERCENT}%. Ôn lại các từ rồi thử lần nữa nhé.`}</p>
          {result.added > 0 && <p className="mt-1 text-body-md text-on-surface-variant" data-testid="unit-result-added">Đã thêm {result.added} từ làm sai vào bộ ôn.</p>}
          {result.missed > 0 && <p className="mt-1 text-body-sm text-on-surface-variant">{result.missed} từ làm sai chưa có câu thật trong video nên chưa lưu được thẻ.</p>}
          {!result.saved && <p className="mt-1 text-body-sm text-on-surface-variant">Chưa ghi nhớ được tiến độ lần này (mất kết nối?).</p>}
          <div className="mt-space-md flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => { setStep("learn"); setResult(null); }} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container"><Icon name="replay" size={20} /> {isReview ? "Làm lại bài" : "Học lại chặng"}</button>
            {result.passed && hasNext && <Link href={`/hoc/${slug}/${detail.unit.idx + 1}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">Chặng tiếp theo <Icon name="arrow_forward" size={20} /></Link>}
            <Link href={`/hoc?khoa=${slug}`} className="inline-flex min-h-12 items-center rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container">Về lộ trình</Link>
          </div>
        </div>
      )}
    </div>
  );
}
