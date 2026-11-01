import { EmojiIcon } from "@/components/ui/emoji-icon";
import Link from "next/link";
import type { UnitProgress } from "@/lib/courses/course-types";
import { UNIT_LEVELS, isLevelUnlocked, levelScores, passedLevels } from "@/lib/courses/unit-levels";
import { Icon } from "@/components/ui/icon";

/** Năm cấp của một chặng với trạng thái: đã qua (kèm điểm cao nhất), đang mở, hoặc khóa (kèm cấp cần qua). `extraPassed`: cấp vừa qua trong lượt này, chưa có trong `progress`. */
export function UnitLevelList({ slug, idx, progress, extraPassed = [], currentLevel }: { slug: string; idx: number; progress: UnitProgress | undefined; extraPassed?: number[]; currentLevel?: number }) {
  const scores = levelScores(progress);
  const passed = [...new Set([...passedLevels(progress), ...extraPassed])] as ReturnType<typeof passedLevels>;
  return (
    <ol aria-label="Các cấp của chặng" className="space-y-1.5">
      {UNIT_LEVELS.map((l) => {
        const done = passed.includes(l.id);
        const open = isLevelUnlocked(l.id, passed);
        const score = scores[l.id];
        const row = `flex min-h-12 items-center gap-3 rounded-xl border-2 px-3 py-1.5 text-left ${done ? "border-secondary bg-secondary-container" : open ? "border-ink bg-surface-container-lowest" : "border-outline-variant opacity-60"} ${currentLevel === l.id ? "ring-2 ring-primary" : ""}`;
        const body = (
          <>
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface text-label-md font-extrabold">{done ? <Icon name="check" size={16} /> : open ? l.id : <Icon name="block" size={14} />}</span>
            <span className="min-w-0 flex-1"><span className="block text-label-lg font-extrabold">Cấp {l.id}: {l.name}{l.id === 5 && <> <EmojiIcon e="⭐" /></>}</span><span className="block text-label-sm text-on-surface-variant">{open ? l.blurb : `Qua cấp ${l.id === 3 || l.id === 4 ? 2 : l.id === 5 ? 3 : 1} để mở`}</span></span>
            {score !== undefined && <span className="shrink-0 text-label-md font-bold">{score}%</span>}
          </>
        );
        return <li key={l.id}>{open ? <Link href={l.id === 1 ? `/courses/${slug}/${idx}` : `/courses/${slug}/${idx}?level=${l.id}`} className={`${row} hover:brightness-105`}>{body}</Link> : <div className={row} aria-disabled="true">{body}</div>}</li>;
      })}
    </ol>
  );
}
