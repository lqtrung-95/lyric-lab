"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PASS_PERCENT } from "@/lib/courses/build-unit-quiz";
import { writeLastCourse } from "@/lib/courses/last-course";
import { PLACEMENT_PASS_RATIO, scorePlacement, type PlacementQuestion } from "@/lib/courses/placement";

type Phase = { name: "intro" } | { name: "loading" } | { name: "error" } | { name: "quiz"; questions: PlacementQuestion[]; i: number; answers: (string | null)[] } | { name: "result"; questions: PlacementQuestion[]; answers: (string | null)[] };

/**
 * Bài xếp lớp: 30 câu "chữ Hán → nghĩa" (5 câu mỗi cấp HSK 1–6), không báo đúng/sai từng câu cho nhanh và công bằng, có lựa chọn "Chưa biết" để không phải đoán mò.
 * Kết quả gợi ý cấp nên bắt đầu (cấp đầu tiên chưa đạt 60%) và mở thẳng bản đồ cấp đó. Đây là gợi ý, người học vẫn vào cấp nào cũng được.
 */
export function PlacementScreen() {
  const [phase, setPhase] = useState<Phase>({ name: "intro" });

  async function start() {
    setPhase({ name: "loading" });
    try {
      const res = await fetch("/api/placement", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const { questions } = (await res.json()) as { questions: PlacementQuestion[] };
      setPhase({ name: "quiz", questions, i: 0, answers: [] });
    } catch {
      setPhase({ name: "error" });
    }
  }

  function answer(choice: string | null) {
    if (phase.name !== "quiz") return;
    const answers = [...phase.answers, choice];
    if (phase.i + 1 >= phase.questions.length) setPhase({ name: "result", questions: phase.questions, answers });
    else setPhase({ ...phase, i: phase.i + 1, answers });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-space-md">
      <Link href="/hoc" className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} /> Lộ trình</Link>
      <h1 className="text-headline-lg-mobile md:text-headline-lg">Bài xếp lớp HSK</h1>

      {phase.name === "intro" && (
        <div className="card-ink p-space-md">
          <p className="text-body-lg">30 câu, khoảng 3 phút: nhìn chữ Hán, chọn nghĩa tiếng Việt. Câu nào chưa biết cứ chọn “Chưa biết”, đừng đoán mò để kết quả đúng với trình độ của bạn.</p>
          <p className="mt-1 text-body-md text-on-surface-variant">Cuối bài, SongHanzi gợi ý cấp nên bắt đầu. Bạn vẫn vào học cấp nào cũng được.</p>
          <button type="button" onClick={() => void start()} className="btn-3d btn-3d-bright mt-space-md">Bắt đầu <Icon name="arrow_forward" size={20} /></button>
        </div>
      )}
      {phase.name === "loading" && <p role="status" className="text-body-md text-on-surface-variant">Đang chuẩn bị bài…</p>}
      {phase.name === "error" && (
        <div role="alert" className="card-ink p-space-md">
          <p className="text-body-md text-error">Chưa tải được bài xếp lớp. Kiểm tra kết nối rồi thử lại nhé.</p>
          <button type="button" onClick={() => void start()} className="btn-3d btn-3d-neutral mt-space-sm">Thử lại</button>
        </div>
      )}
      {phase.name === "quiz" && <QuizCard key={phase.i} q={phase.questions[phase.i]} i={phase.i} total={phase.questions.length} onAnswer={answer} />}
      {phase.name === "result" && <Result questions={phase.questions} answers={phase.answers} onRetry={() => void start()} />}
    </div>
  );
}

function QuizCard({ q, i, total, onAnswer }: { q: PlacementQuestion; i: number; total: number; onAnswer: (choice: string | null) => void }) {
  return (
    <div className="space-y-space-md">
      <div>
        <p className="text-label-md font-bold text-on-surface-variant" aria-live="polite">Câu {i + 1}/{total}</p>
        <ProgressBar value={i} max={total} label="Tiến độ bài xếp lớp" size="sm" className="mt-1" />
      </div>
      <div className="card-ink p-space-md text-center">
        <p lang="zh-Hans" className="font-serif text-[64px] font-semibold leading-none">{q.term}</p>
        {q.pinyin && <p className="mt-1 text-body-lg text-primary">{q.pinyin}</p>}
      </div>
      <div role="group" aria-label="Các lựa chọn" className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => <button key={o} type="button" onClick={() => onAnswer(o)} className="min-h-14 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-left text-body-lg shadow-[0_3px_0_var(--shadow-ink)] active:translate-y-[3px] active:shadow-none">{o}</button>)}
      </div>
      <button type="button" onClick={() => onAnswer(null)} className="inline-flex min-h-11 items-center text-label-md font-bold text-on-surface-variant underline">Chưa biết</button>
    </div>
  );
}

function Result({ questions, answers, onRetry }: { questions: PlacementQuestion[]; answers: (string | null)[]; onRetry: () => void }) {
  const r = scorePlacement(questions, answers);
  const levels = Object.keys(r.byLevel).map(Number);
  return (
    <div className="space-y-space-md" data-testid="placement-result">
      <div className="card-ink bg-primary-container p-space-md text-on-primary-container">
        <p className="text-label-md font-bold">Gợi ý cho bạn</p>
        <p className="text-headline-lg-mobile md:text-headline-lg">Bắt đầu từ HSK {r.startLevel}</p>
        <Link href={`/hoc?khoa=hsk-${r.startLevel}`} onClick={() => writeLastCourse(`hsk-${r.startLevel}`)} className="btn-3d mt-space-sm">Mở lộ trình HSK {r.startLevel} <Icon name="arrow_forward" size={20} /></Link>
      </div>
      <ul className="space-y-2" aria-label="Kết quả từng cấp">
        {levels.map((l) => {
          const pct = Math.round(100 * r.byLevel[l]);
          return (
            <li key={l} className="card-ink p-space-sm">
              <p className="flex justify-between text-body-md font-bold"><span>HSK {l}</span><span>{pct}%{r.byLevel[l] >= PLACEMENT_PASS_RATIO ? " · nắm tốt" : ""}</span></p>
              <ProgressBar value={pct} max={100} label={`Kết quả HSK ${l}`} size="sm" tone={r.byLevel[l] >= PLACEMENT_PASS_RATIO ? "success" : "primary"} className="mt-1" />
            </li>
          );
        })}
      </ul>
      <p className="text-body-sm text-on-surface-variant">Mỗi cấp chỉ 5 câu nên đây chỉ là ước lượng (ngưỡng nắm cấp: {Math.round(PLACEMENT_PASS_RATIO * 100)}%; hoàn thành một chặng cần {PASS_PERCENT}%). Cảm thấy chưa đúng thì cứ chọn cấp khác.</p>
      <button type="button" onClick={onRetry} className="btn-3d btn-3d-neutral"><Icon name="replay" size={20} /> Làm lại</button>
    </div>
  );
}
