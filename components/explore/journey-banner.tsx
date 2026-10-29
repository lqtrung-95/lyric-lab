"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ExploreProgress } from "@/lib/explore/explore-progress";
import { journeyStatus, stepsAtScene } from "@/lib/explore/journeys";
import { progressKey } from "@/lib/explore/explore-progress";

/**
 * Nhắc trong cảnh: "bạn đang trong hành trình X, chặng N: học các từ này". Chỉ hiện cho chặng của cảnh này mà hành trình CHƯA hoàn thành chặng đó.
 * `words` là các vật của cảnh (để lấy chữ Hán và nghĩa của từ mục tiêu).
 */
export function JourneyBanner({ sceneId, words, progress }: { sceneId: string; words: readonly { id: string; term: string; gloss: string }[]; progress: ExploreProgress }) {
  const items = useMemo(() => stepsAtScene(sceneId).map(({ journey, index }) => ({ journey, index, st: journeyStatus(journey, progress).steps[index], step: journey.steps[index] })).filter((x) => !x.st.done), [sceneId, progress]);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {items.map(({ journey, index, st, step }) => (
        <section key={`${journey.id}-${index}`} aria-label={`Hành trình ${journey.title.vi}`} className="card-ink flex flex-col gap-1 bg-secondary-container p-space-sm text-on-secondary-container">
          <p className="text-label-md font-extrabold">{journey.emoji} Hành trình “{journey.title.vi}” · chặng {index + 1}/{journey.steps.length}</p>
          <p className="text-body-md">{step.vi}</p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Từ mục tiêu">
            {step.targets.map((id) => {
              const w = words.find((x) => x.id === id);
              const learned = !!progress.terms[progressKey(sceneId, id)];
              return w ? <li key={id} className="rounded-full border-2 border-ink bg-surface-container-lowest px-2.5 py-0.5 text-label-md font-bold"><span lang="zh-Hans">{w.term}</span> {learned ? "✓" : "○"}</li> : null;
            })}
          </ul>
          <p className="text-label-md">{st.learned < st.total ? "Chạm vào các đồ vật để học đủ 3 từ." : `Đã học đủ. Làm nhiệm vụ của cảnh để trả lời đúng (${st.correct}/${st.need}).`} <Link href="/explore?tab=journeys" className="font-bold underline">Xem hành trình</Link></p>
        </section>
      ))}
    </div>
  );
}
