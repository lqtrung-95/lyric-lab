"use client";

import Link from "next/link";
import { useState } from "react";
import { usePracticePool } from "@/components/practice/use-practice-pool";
import { Icon } from "@/components/ui/icon";
import { PASS_PERCENT, REVIEW_QUIZ_KINDS } from "@/lib/courses/build-unit-quiz";
import { recordQuizOutcome } from "@/lib/courses/weak-terms";
import type { UnitDetail } from "@/lib/courses/unit-types";
import { UnitQuizStep } from "./unit-quiz-step";

const QUICK_LENGTH = 10;

/**
 * Ôn nhanh một chặng đã học: 10 câu trộn kiểu (như chặng ôn tổng hợp), không có bước học lại và không đổi trạng thái hoàn thành của chặng. Câu trả lời được chấm vào lịch FSRS của từng từ
 * (đúng: nhớ; sai: quên) khi thẻ đến hạn, nên ôn ở đây cũng dời lịch thẻ ôn như ôn trong mục Ôn tập.
 */
export function UnitQuickReview({ slug, detail }: { slug: string; detail: UnitDetail }) {
  const { cards, grade, status } = usePracticePool();
  const [result, setResult] = useState<{ percent: number; scheduled: number } | null>(null);

  function finish(percent: number, _passed: boolean, wrong: string[], right: string[]) {
    recordQuizOutcome(wrong, right.filter((t) => !wrong.includes(t)));
    let scheduled = 0;
    for (const t of new Set([...wrong, ...right])) {
      const card = cards.find((c) => c.term === t && c.kind === "vocab");
      if (card && grade(card, wrong.includes(t) ? "wrong" : "correct")) scheduled++;
    }
    setResult({ percent, scheduled });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <Link href={`/courses?course=${slug}`} className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} /> Lộ trình {detail.course.title}</Link>
      <header>
        <p className="text-label-md text-on-surface-variant">Ôn nhanh · chặng {detail.unit.idx}</p>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{detail.unit.title}</h1>
      </header>
      {!result ? (
        status === "loading" ? <p role="status" className="text-body-md text-on-surface-variant">Đang tải…</p> : <UnitQuizStep words={detail.words} length={QUICK_LENGTH} kinds={REVIEW_QUIZ_KINDS} onFinish={finish} />
      ) : (
        <div className="card-ink p-space-lg text-center" data-testid="quick-review-result">
          <p className="font-serif text-headline-lg">{result.percent}%</p>
          <p className="mt-1 text-body-lg">{result.percent >= PASS_PERCENT ? "Nhớ tốt! Các từ của chặng này vừa được làm mới trí nhớ." : "Còn vài từ chưa chắc. Ôn thêm một lượt nữa là nhớ hơn."}</p>
          {result.scheduled > 0 && <p className="mt-1 text-body-md text-on-surface-variant">Đã cập nhật lịch ôn của {result.scheduled} thẻ.</p>}
          <div className="mt-space-md flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setResult(null)} className="btn-3d btn-3d-primary min-h-12 px-6 font-extrabold">Ôn thêm lượt nữa</button>
            <Link href={`/courses?course=${slug}`} className="btn-3d btn-3d-neutral inline-flex min-h-12 items-center px-6 font-extrabold">Về lộ trình</Link>
          </div>
        </div>
      )}
    </div>
  );
}
