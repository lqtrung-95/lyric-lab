"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { scoreWriting, type WritingScore } from "@/lib/tra-tu/score-writing";
import { useHanziWriter, WRITER_SIZE } from "./use-hanzi-writer";

type Mode = "watch" | "practice";
const tab = "inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold";

/**
 * Thứ tự nét và tập viết MỘT chữ. "Xem": hoạt hình từng nét (phát lại, tô màu nét bộ thủ nếu dữ liệu có). "Tập viết": ô trống, người học vẽ từng nét bằng chuột/ngón tay;
 * nét sai nhiều lần được gợi ý, viết xong có điểm (`scoreWriting`). Dữ liệu nét: Make Me a Hanzi qua hanzi-writer-data (Arphic Public License).
 */
export function StrokeWriter({ char, startMode = "watch", blind = false, onScore }: { char: string; /** Chế độ mở đầu (trang Tập viết vào thẳng chế độ viết). */ startMode?: Mode; /** Ẩn cả khung mờ ở chế độ viết (tập nhớ nét); nét sai nhiều lần vẫn được gợi ý. */ blind?: boolean; /** Gọi khi viết xong một chữ. */ onScore?: (score: WritingScore) => void }) {
  const target = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>(startMode);
  const [radical, setRadical] = useState(false);
  const [progress, setProgress] = useState<{ done: number; mistakes: number }>({ done: 0, mistakes: 0 });
  const [score, setScore] = useState<WritingScore | null>(null);
  const [attempt, setAttempt] = useState(0);
  const { writer, strokeCount, hasRadical, failed } = useHanziWriter(target, char);

  useEffect(() => {
    if (!writer) return;
    writer.cancelQuiz();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScore(null); setProgress({ done: 0, mistakes: 0 });
    if (mode === "watch") { writer.showCharacter(); writer.showOutline(); void writer.animateCharacter(); return; }
    writer.hideCharacter();
    if (blind) writer.hideOutline();
    let mistakes = 0;
    writer.quiz({
      onMistake: () => { mistakes++; setProgress((p) => ({ ...p, mistakes })); },
      onCorrectStroke: (s) => setProgress((p) => ({ ...p, done: s.strokeNum + 1 })),
      onComplete: (s) => { const sc = scoreWriting(strokeCount ?? 1, s.totalMistakes); setScore(sc); onScore?.(sc); },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- onScore chỉ là callback báo kết quả, không được làm bắt đầu lại lượt viết
  }, [writer, mode, strokeCount, char, attempt, blind]);

  useEffect(() => {
    if (!writer) return;
    writer.updateColor("radicalColor", radical ? getComputedStyle(document.documentElement).getPropertyValue("--secondary").trim() || "#3b6931" : null);
  }, [writer, radical]);

  return (
    <div className="space-y-space-sm">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chế độ">
        <button type="button" aria-pressed={mode === "watch"} onClick={() => setMode("watch")} className={`${tab} ${mode === "watch" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>Xem nét</button>
        <button type="button" aria-pressed={mode === "practice"} onClick={() => setMode("practice")} className={`${tab} ${mode === "practice" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>Tập viết</button>
        {strokeCount != null && <span className="text-label-md text-on-surface-variant">{strokeCount} nét</span>}
      </div>

      <div className="relative mx-auto touch-none" style={{ width: WRITER_SIZE, height: WRITER_SIZE }}>
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full text-outline-variant">
          <rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M0 0L100 100M100 0L0 100M50 0V100M0 50H100" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" fill="none" />
        </svg>
        <div ref={target} role="img" aria-label={`Thứ tự nét của chữ ${char}`} className="absolute inset-0" />
      </div>

      {failed && <p role="alert" className="text-center text-body-md text-on-surface-variant">Chưa có dữ liệu nét cho chữ này.</p>}
      <p role="status" className="min-h-6 text-center text-body-md">
        {mode === "practice" && !score && strokeCount != null && `Nét ${Math.min(progress.done + 1, strokeCount)}/${strokeCount} · sai ${progress.mistakes} lần`}
        {score && <span className="font-bold">{"★".repeat(score.stars)}{"☆".repeat(3 - score.stars)} {score.percent}% · {score.label}</span>}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {mode === "watch" && <button type="button" disabled={!writer} onClick={() => void writer?.animateCharacter()} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold"><span className="inline-flex items-center gap-1"><Icon name="replay" size={20} /> Phát lại</span></button>}
        {mode === "practice" && <button type="button" disabled={!writer} onClick={() => setAttempt((a) => a + 1)} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold"><span className="inline-flex items-center gap-1"><Icon name="replay" size={20} /> Viết lại</span></button>}
        {hasRadical && <button type="button" aria-pressed={radical} onClick={() => setRadical((v) => !v)} className={`${tab} ${radical ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-lowest"}`}>Tô bộ thủ</button>}
      </div>
    </div>
  );
}
