"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RubyLine } from "@/components/ui/ruby-text";
import type { ExploreProgress } from "@/lib/explore/explore-progress";
import { JOURNEYS, journeyStatus, type Journey, type JourneyStatus } from "@/lib/explore/journeys";
import { SCENES } from "@/lib/explore/scenes";
import { SCENE_EMOJI } from "@/lib/explore/town-layout";

/** Pinyin (từ từ điển, qua server) của tên và câu hướng dẫn; tải khi mở tab, lỗi thì bỏ qua (chỉ thiếu dòng pinyin). */
function useJourneyPinyin(): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    fetch("/api/explore/journeys-pinyin").then((r) => (r.ok ? (r.json() as Promise<{ pinyin?: Record<string, string> }>) : { pinyin: {} })).catch(() => ({ pinyin: {} }))
      .then((d) => { if (live) setMap(d.pinyin ?? {}); });
    return () => { live = false; };
  }, []);
  return map;
}

function JourneyCard({ j, st, pinyin }: { j: Journey; st: JourneyStatus; pinyin: Record<string, string> }) {
  return (
    <li className="card-ink flex flex-col gap-space-sm p-space-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-headline-md"><span aria-hidden="true">{j.emoji}</span> {j.title.vi}</h2>
          <p lang="zh-Hans" className="text-label-md font-bold leading-[2.1]"><RubyLine zh={j.title.zh} pinyin={pinyin[j.title.zh]} show={!!pinyin[j.title.zh]} /></p>
          <p className="text-body-sm text-on-surface-variant">{j.blurb}</p>
        </div>
        {st.complete
          ? <span className="rounded-full border-2 border-ink bg-secondary-container px-3 py-1 text-label-md font-extrabold text-on-secondary-container">🎖 Hoàn thành</span>
          : <span className="rounded-full border-2 border-ink bg-surface-container-lowest px-3 py-1 text-label-md font-extrabold">{st.doneCount}/{j.steps.length} chặng</span>}
      </div>
      <ProgressBar value={st.doneCount} max={j.steps.length} label={`Tiến độ hành trình ${j.title.vi}`} size="sm" tone={st.complete ? "success" : "primary"} />
      <ol className="flex flex-col gap-2">
        {j.steps.map((s, i) => {
          const ss = st.steps[i];
          const scene = SCENES[s.sceneId];
          const isCurrent = st.current === i;
          return (
            <li key={`${s.sceneId}-${i}`}>
              <Link href={`/explore/${s.sceneId}`} aria-current={isCurrent ? "step" : undefined}
                className={`flex min-h-14 items-center gap-3 rounded-xl border-2 p-2 transition-colors hover:bg-surface-container-low ${isCurrent ? "border-ink bg-primary-container" : ss.done ? "border-ink/40 bg-secondary-container/50" : "border-ink/25 bg-surface-container-lowest"}`}>
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-xl">{ss.done ? "✅" : SCENE_EMOJI[s.sceneId]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-label-lg font-extrabold">Chặng {i + 1}: {scene?.title}{isCurrent ? " · đang ở đây" : ""}</span>
                  <span lang="zh-Hans" className="block text-body-md font-bold leading-[2.1]"><RubyLine zh={s.zh} pinyin={pinyin[s.zh]} show={!!pinyin[s.zh]} /></span>
                  <span className="block text-body-sm text-on-surface-variant">{s.vi}</span>
                  <span className="block text-label-md text-on-surface-variant">
                    {ss.done ? "Đã xong chặng này" : `Học ${ss.learned}/${ss.total} từ mục tiêu · trả lời đúng ${ss.correct}/${ss.need} lần ở nhiệm vụ của cảnh`}
                  </span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-lg font-bold text-primary">›</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </li>
  );
}

/**
 * Tab "Hành trình": mỗi hành trình là một chuỗi cảnh nối thành câu chuyện trong ngày. Chặng xong khi học đủ 3 từ mục tiêu của cảnh VÀ trả lời đúng
 * ở nhiệm vụ của cảnh (tính lại từ tiến độ khám phá, không lưu riêng). Câu hướng dẫn có pinyin từ từ điển.
 */
export function JourneysView({ progress }: { progress: ExploreProgress }) {
  const pinyin = useJourneyPinyin();
  const statuses = useMemo(() => JOURNEYS.map((j) => journeyStatus(j, progress)), [progress]);
  const done = statuses.filter((s) => s.complete).length;
  return (
    <div className="flex flex-col gap-space-md">
      <p className="text-label-md text-on-surface-variant">Mỗi hành trình đi qua nhiều cảnh như một ngày thật. Ở mỗi cảnh, học 3 từ mục tiêu rồi làm nhiệm vụ của cảnh để hoàn thành chặng. Đã hoàn thành {done}/{JOURNEYS.length} hành trình.</p>
      <ul className="flex flex-col gap-space-md">
        {JOURNEYS.map((j, i) => <JourneyCard key={j.id} j={j} st={statuses[i]} pinyin={pinyin} />)}
      </ul>
    </div>
  );
}
