import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { summarizeProgress, type DictationProgress } from "@/lib/video/dictation-progress";
import type { LessonLine } from "@/lib/video/video-lesson-types";
import type { LessonDetail } from "@/lib/video/video-repo";

const WORST_SHOWN = 5;

/** Tổng kết bài chép: điểm trung bình, số câu đúng hoàn toàn, và các câu làm chưa tốt (bấm để xem lại trong bản chép và lưu từ). */
export function DictationSummary({ lesson, lines, progress, onRestart }: { lesson: LessonDetail; lines: LessonLine[]; progress: DictationProgress; onRestart: () => void }) {
  const idxs = lines.map((l) => l.idx);
  const stats = summarizeProgress(idxs, progress);
  const perfect = lines.filter((l) => progress.scores[l.idx] === 1).length;
  const weak = lines.filter((l) => (progress.scores[l.idx] ?? 0) < 1).sort((a, b) => (progress.scores[a.idx] ?? 0) - (progress.scores[b.idx] ?? 0)).slice(0, WORST_SHOWN);
  return (
    <section aria-labelledby="dictation-summary-heading" className="space-y-space-md rounded-2xl bg-surface-container-low p-space-lg text-center">
      <Icon name="emoji_events" filled size={40} className="text-primary" />
      <h2 id="dictation-summary-heading" className="font-serif text-headline-md">Hoàn thành bài chép</h2>
      <p className="text-body-lg text-on-surface-variant">Điểm trung bình <strong className="text-on-surface">{Math.round(stats.average * 100)}%</strong> · {perfect}/{stats.total} câu chính xác hoàn toàn</p>
      {weak.length > 0 && (
        <div className="text-left">
          <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Câu nên xem lại</h3>
          <ul className="mt-1 divide-y divide-outline-variant">
            {weak.map((l) => (
              <li key={l.idx} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span lang="zh" className="block truncate font-serif text-body-lg text-on-surface">{l.text}</span>
                  {l.translation && <span className="block truncate text-label-md text-on-surface-variant">{l.translation}</span>}
                </span>
                <span className="shrink-0 text-label-md text-on-surface-variant">{Math.round((progress.scores[l.idx] ?? 0) * 100)}%</span>
                <Link href={`/video/${lesson.videoId}?t=${Math.floor(l.start)}`} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-label-md font-medium text-primary hover:bg-surface-container">Xem lại</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col justify-center gap-space-sm sm:flex-row">
        <button type="button" onClick={onRestart} className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">Làm lại từ đầu</button>
        <Link href={`/video/${lesson.videoId}`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-surface-container-high px-8 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest">Về video</Link>
      </div>
    </section>
  );
}
