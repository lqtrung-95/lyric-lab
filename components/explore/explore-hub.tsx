"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/explore/explore-progress";
import { SCENES } from "@/lib/explore/scenes";
import { objectiveProgress } from "@/lib/explore/story/objectives";
import { loadStory } from "@/lib/explore/story/story-state";
import type { Objective, StoryDifficulty } from "@/lib/explore/story/story-types";
import { SceneThumb } from "./scene-thumb";
import { DifficultyBadge } from "./story/difficulty-badge";

/** Phần nhẹ của một vụ án đủ để vẽ thẻ trong danh sách (không kéo cả hội thoại về trình duyệt). */
export interface CaseSummary {
  id: string;
  title: string;
  difficulty: StoryDifficulty;
  blurb: string;
  startScene: string;
  solvedFlag: string;
  objectives: Objective[];
}

type Tab = "cases" | "scenes";

/**
 * Trang Khám phá gọn: hai thẻ chuyển (Phá án / Học từ theo cảnh), mỗi mục là một thẻ có ảnh thu nhỏ của cảnh, kèm tiến độ của bạn
 * (vụ án: số mục tiêu đã xong hoặc "Đã giải"; cảnh: số từ đã học).
 */
export function ExploreHub({ cases }: { cases: CaseSummary[] }) {
  const [tab, setTab] = useState<Tab>("cases");
  const [caseState, setCaseState] = useState<Record<string, { done: number; solved: boolean }>>({});
  const [learned, setLearned] = useState<Record<string, number>>({});

  useEffect(() => {
    // Tiến độ nằm ở localStorage (server không đọc được) nên đọc sau khi mount.
    const next: Record<string, { done: number; solved: boolean }> = {};
    for (const c of cases) {
      const p = loadStory(window.localStorage, c.id);
      next[c.id] = { done: objectiveProgress(c.objectives, p.flags).done, solved: p.flags.includes(c.solvedFlag) };
    }
    const terms = Object.keys(loadProgress(window.localStorage).terms);
    const counts: Record<string, number> = {};
    for (const s of Object.values(SCENES)) counts[s.id] = terms.filter((k) => k.startsWith(`${s.id}:`)).length;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaseState(next);
    setLearned(counts);
  }, [cases]);

  const tabCls = (on: boolean) => `min-h-11 flex-1 rounded-full px-4 text-label-md font-extrabold transition-colors ${on ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`;
  const card = "card-ink group block overflow-hidden transition-transform hover:-translate-y-0.5";

  return (
    <div className="flex flex-col gap-space-md">
      <div role="tablist" aria-label="Khám phá" className="flex gap-1 rounded-full border-2 border-ink bg-surface-container-lowest p-1">
        <button type="button" role="tab" aria-selected={tab === "cases"} onClick={() => setTab("cases")} className={tabCls(tab === "cases")}>Phá án ({cases.length})</button>
        <button type="button" role="tab" aria-selected={tab === "scenes"} onClick={() => setTab("scenes")} className={tabCls(tab === "scenes")}>Học từ theo cảnh ({Object.keys(SCENES).length})</button>
      </div>

      {tab === "cases" ? (
        <ul className="grid gap-space-sm sm:grid-cols-2">
          {cases.map((c) => {
            const st = caseState[c.id];
            return (
              <li key={c.id}>
                <Link href={`/explore/cases/${c.id}`} className={card}>
                  <div className="relative">
                    <SceneThumb scene={SCENES[c.startScene]} />
                    <span className="absolute left-2 top-2"><DifficultyBadge level={c.difficulty} /></span>
                    {st?.solved && <span className="absolute right-2 top-2 rounded-full border-2 border-ink bg-surface-container-lowest px-2.5 py-0.5 text-label-md font-extrabold text-primary">✓ Đã giải</span>}
                  </div>
                  <div className="p-space-sm">
                    <h2 className="text-headline-md leading-tight">{c.title}</h2>
                    <p className="mt-0.5 text-body-sm text-on-surface-variant">{c.blurb}</p>
                    <p className="mt-1 text-label-md font-extrabold text-primary">{st && st.done > 0 && !st.solved ? `Đang điều tra: ${st.done}/${c.objectives.length}` : st?.solved ? "Chơi lại" : "Bắt đầu"}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-space-sm sm:grid-cols-3">
          {Object.values(SCENES).map((s) => (
            <li key={s.id}>
              <Link href={`/explore/${s.id}`} className={card}>
                <SceneThumb scene={s} />
                <div className="px-space-sm py-2">
                  <h2 className="text-label-lg font-extrabold leading-tight">{s.title}</h2>
                  <p className="text-label-md text-on-surface-variant">{learned[s.id] ?? 0}/{s.objects.length} từ đã học</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
