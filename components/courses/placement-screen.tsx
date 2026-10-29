"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PASS_PERCENT } from "@/lib/courses/build-unit-quiz";
import { writeLastCourse } from "@/lib/courses/last-course";
import { PLACEMENT_PASS_RATIO, scorePlacement, shouldStopEarly, WRONG_PENALTY, type PlacementKind, type PlacementQuestion } from "@/lib/courses/placement";
import { playChinese } from "@/lib/speech/play-chinese";

type Phase = { name: "intro" } | { name: "loading" } | { name: "error" } | { name: "quiz"; questions: PlacementQuestion[]; i: number; answers: (string | null)[] } | { name: "result"; questions: PlacementQuestion[]; answers: (string | null)[] };

/**
 * Bài xếp lớp nhiều dạng câu (nghĩa, pinyin/thanh điệu, điền từ vào câu thật, nhớ chữ, nghe hiểu), 6 câu mỗi cấp HSK 1–6, không báo đúng/sai từng câu cho nhanh và công bằng.
 * Đoán sai bị trừ điểm còn "Chưa biết" thì không, nên đoán mò không có lợi; hai cấp liên tiếp quá khó thì dừng sớm.
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
    const done = phase.i + 1;
    if (done >= phase.questions.length) { setPhase({ name: "result", questions: phase.questions, answers }); return; }
    // Hết một cấp: nếu hai cấp gần nhất đều quá khó thì dừng, kết quả tính trên các câu đã hỏi.
    if (phase.questions[done].level !== phase.questions[phase.i].level && shouldStopEarly(scorePlacement(phase.questions.slice(0, done), answers).byLevel)) {
      setPhase({ name: "result", questions: phase.questions.slice(0, done), answers });
      return;
    }
    setPhase({ ...phase, i: done, answers });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-space-md">
      <Link href="/courses" className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} /> Lộ trình</Link>
      <h1 className="text-headline-lg-mobile md:text-headline-lg">Bài xếp lớp HSK</h1>

      {phase.name === "intro" && (
        <div className="card-ink p-space-md">
          <p className="text-body-lg">Tối đa 36 câu, khoảng 5 phút, từ HSK 1 lên HSK 6. Có nhiều dạng: chọn nghĩa, chọn pinyin đúng thanh điệu, điền từ vào câu thật, nhớ chữ Hán từ nghĩa và nghe hiểu.</p>
          <p className="mt-1 text-body-md text-on-surface-variant">Câu nào chưa biết cứ chọn “Chưa biết” (không bị trừ điểm). Chọn sai sẽ bị trừ một phần điểm nên đoán mò không có lợi, và kết quả sẽ đúng với trình độ thật của bạn. Gặp hai cấp liên tiếp quá khó thì bài tự dừng. Cuối bài, SongHanzi gợi ý cấp nên bắt đầu; bạn vẫn vào học cấp nào cũng được.</p>
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

const PROMPT: Record<PlacementKind, string> = {
  meaning: "Chữ này nghĩa là gì?",
  pinyin: "Chữ này đọc thế nào? (chú ý thanh điệu)",
  cloze: "Chọn từ điền vào chỗ trống",
  reverse: "Từ nào có nghĩa này?",
  listen: "Nghe và chọn nghĩa đúng",
};
/** Dạng câu mà đáp án là chữ Hán (hiện chữ lớn, kiểu chữ có chân). */
const HAN_OPTIONS: PlacementKind[] = ["reverse", "cloze"];

function QuizCard({ q, i, total, onAnswer }: { q: PlacementQuestion; i: number; total: number; onAnswer: (choice: string | null) => void }) {
  // Câu nghe: tự đọc khi hiện (sau thao tác bấm đáp án trước đó nên thường được trình duyệt cho phép; không được thì có nút "Nghe").
  useEffect(() => { if (q.kind === "listen") void playChinese(q.term); }, [q.kind, q.term]);
  const han = HAN_OPTIONS.includes(q.kind);
  return (
    <div className="space-y-space-md">
      <div>
        <p className="text-label-md font-bold text-on-surface-variant" aria-live="polite">Câu {i + 1}/{total} · HSK {q.level}</p>
        <ProgressBar value={i} max={total} label="Tiến độ bài xếp lớp" size="sm" className="mt-1" />
      </div>
      <p className="text-label-lg font-extrabold">{PROMPT[q.kind]}</p>
      <div className="card-ink p-space-md text-center">
        {(q.kind === "meaning" || q.kind === "pinyin") && <p lang="zh-Hans" className="font-serif text-[64px] font-semibold leading-none">{q.term}</p>}
        {q.kind === "reverse" && <p className="text-headline-md font-bold">{q.gloss}</p>}
        {q.kind === "cloze" && (
          <>
            <p lang="zh-Hans" className="font-serif text-headline-lg-mobile font-semibold leading-snug md:text-headline-lg">{q.before}<span role="img" aria-label="chỗ trống" className="mx-1 inline-block min-w-[3ch] border-b-4 border-current">{"\u00a0\u00a0\u00a0\u00a0"}</span>{q.after}</p>
            {q.translation && <p className="mt-2 text-body-md text-on-surface-variant">{q.translation}</p>}
          </>
        )}
        {q.kind === "listen" && (
          <button type="button" onClick={() => void playChinese(q.term)} className="btn-3d btn-3d-bright mx-auto"><Icon name="volume_up" size={24} /> Nghe</button>
        )}
      </div>
      <div role="group" aria-label="Các lựa chọn" className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => (
          <button key={o} type="button" onClick={() => onAnswer(o)} lang={han ? "zh-Hans" : undefined}
            className={`min-h-14 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 shadow-[0_3px_0_var(--shadow-ink)] active:translate-y-[3px] active:shadow-none ${han ? "text-center font-serif text-headline-md" : "text-left text-body-lg"}`}>{o}</button>
        ))}
      </div>
      <button type="button" onClick={() => onAnswer(null)} className="inline-flex min-h-11 items-center text-label-md font-bold text-on-surface-variant underline">Chưa biết</button>
    </div>
  );
}

const KIND_LABEL: Record<PlacementKind, string> = {
  meaning: "Nhận mặt chữ, hiểu nghĩa", pinyin: "Đọc đúng pinyin và thanh điệu", cloze: "Hiểu từ trong câu thật", reverse: "Nhớ chữ Hán từ nghĩa", listen: "Nghe hiểu",
};
const KIND_TIP: Record<PlacementKind, string> = {
  meaning: "ôn thẻ từ vựng của lộ trình để nhớ nghĩa chắc hơn.",
  pinyin: "luyện thanh điệu ở mục Luyện phát âm.",
  cloze: "học từ qua câu thật trong bài hát và video để quen cách dùng.",
  reverse: "tập nhớ chữ: ôn thẻ và tự đoán chữ Hán trước khi lật.",
  listen: "nghe nhiều hơn ở màn Nghe, bật pinyin rồi tắt dần.",
};

function Result({ questions, answers, onRetry }: { questions: PlacementQuestion[]; answers: (string | null)[]; onRetry: () => void }) {
  const r = scorePlacement(questions, answers);
  const levels = Object.keys(r.byLevel).map(Number);
  const kinds = (Object.keys(r.byKind) as PlacementKind[]);
  const weakest = kinds.length > 1 ? kinds.reduce((a, b) => (r.byKind[b]! < r.byKind[a]! ? b : a)) : null;
  return (
    <div className="space-y-space-md" data-testid="placement-result">
      <div className="card-ink bg-primary-container p-space-md text-on-primary-container">
        <p className="text-label-md font-bold">Gợi ý cho bạn</p>
        <p className="text-headline-lg-mobile md:text-headline-lg">Bắt đầu từ HSK {r.startLevel}</p>
        <Link href={`/courses?course=hsk-${r.startLevel}`} onClick={() => writeLastCourse(`hsk-${r.startLevel}`)} className="btn-3d mt-space-sm">Mở lộ trình HSK {r.startLevel} <Icon name="arrow_forward" size={20} /></Link>
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
      {kinds.length > 0 && (
        <section aria-label="Kết quả theo kỹ năng" className="card-ink p-space-sm">
          <h2 className="text-label-lg font-extrabold">Theo kỹ năng</h2>
          <ul className="mt-1 space-y-2">
            {kinds.map((k) => {
              const pct = Math.round(100 * r.byKind[k]!);
              return (
                <li key={k}>
                  <p className="flex justify-between text-body-md"><span>{KIND_LABEL[k]}</span><span className="font-bold">{pct}%</span></p>
                  <ProgressBar value={pct} max={100} label={KIND_LABEL[k]} size="sm" tone={r.byKind[k]! >= PLACEMENT_PASS_RATIO ? "success" : "primary"} className="mt-1" />
                </li>
              );
            })}
          </ul>
          {weakest && r.byKind[weakest]! < PLACEMENT_PASS_RATIO && <p role="status" className="mt-2 text-body-md"><span className="font-bold">Nên luyện thêm: </span>{KIND_TIP[weakest]}</p>}
        </section>
      )}
      {r.wrong > 0 && <p className="text-body-sm text-on-surface-variant">Bạn trả lời sai {r.wrong} câu; mỗi câu sai bị trừ {Math.round(WRONG_PENALTY * 100)}% điểm của một câu đúng. Lần sau chưa chắc thì chọn “Chưa biết” để kết quả sát trình độ hơn.</p>}
      <p className="text-body-sm text-on-surface-variant">Mỗi cấp chỉ 6 câu nên đây chỉ là ước lượng (ngưỡng nắm cấp: {Math.round(PLACEMENT_PASS_RATIO * 100)}%; hoàn thành một chặng cần {PASS_PERCENT}%). Cảm thấy chưa đúng thì cứ chọn cấp khác.</p>
      <button type="button" onClick={onRetry} className="btn-3d btn-3d-neutral"><Icon name="replay" size={20} /> Làm lại</button>
    </div>
  );
}
