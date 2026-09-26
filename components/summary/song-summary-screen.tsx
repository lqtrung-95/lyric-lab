"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { useDueCount } from "@/components/review/use-due-count";
import { summarizeSong } from "@/lib/preview/summarize-song";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Tổng kết sau khi nghe hết bài (S8, RV-03): số từ đã lưu, đã biết, % từ vựng của bài đã hiểu, và ba hành động tiếp theo. */
export function SongSummaryScreen({ analysis, title }: { analysis: SongAnalysis; title: string }) {
  const { state } = useLearnerState();
  const dueCount = useDueCount();
  const s = useMemo(() => summarizeSong(analysis.videoId, analysis.items, state), [analysis, state]);
  const action = "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-label-md font-semibold";

  return (
    <div className="mx-auto max-w-xl py-space-lg text-center">
      <p className="text-label-md uppercase tracking-wider text-secondary">Xong bài hát</p>
      <h1 className="mt-1 font-serif text-headline-lg-mobile md:text-headline-lg">Bạn vừa học xong <span lang="zh">{title}</span></h1>

      <div className="mx-auto mt-space-lg h-36 w-36">
        <svg viewBox="0 0 120 120" role="img" aria-label={`Hiểu ${s.understoodPercent}% từ vựng của bài`} className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" className="stroke-surface-container-highest" />
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-primary"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - s.understoodPercent / 100)} />
        </svg>
      </div>
      <p className="mt-space-sm font-serif text-headline-md text-on-surface">Hiểu {s.understoodPercent}% từ vựng của bài</p>
      <p className="text-label-md text-on-surface-variant">{s.vocabUnderstood} / {s.vocabTotal} từ vựng (đã biết hoặc dưới level HSK {state.level})</p>

      <dl className="mt-space-lg grid grid-cols-2 gap-space-sm">
        <div className="rounded-2xl bg-surface-container-low p-space-md"><dt className="text-label-md text-on-surface-variant">Đã lưu từ bài này</dt><dd className="font-serif text-headline-lg text-primary">{s.savedCount}</dd></div>
        <div className="rounded-2xl bg-surface-container-low p-space-md"><dt className="text-label-md text-on-surface-variant">Đánh dấu đã biết</dt><dd className="font-serif text-headline-lg text-secondary">{s.knownCount}</dd></div>
      </dl>

      <div className="mt-space-lg flex flex-col justify-center gap-space-sm sm:flex-row">
        {dueCount ? (
          <Link href="/review" className={`${action} bg-primary text-on-primary hover:bg-primary-container`}>Ôn ngay {dueCount} thẻ</Link>
        ) : null}
        <Link href={`/learn/${analysis.videoId}/listen`} className={`${action} bg-surface-container-high text-on-surface hover:bg-surface-container-highest`}>Nghe lại</Link>
        <Link href="/app" className={`${action} bg-surface-container-high text-on-surface hover:bg-surface-container-highest`}>Bài mới</Link>
      </div>
    </div>
  );
}
