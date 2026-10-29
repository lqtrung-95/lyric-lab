"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { emptyProgress, loadProgress, type ExploreProgress } from "@/lib/explore/explore-progress";
import { fadingByScene, mostFadingScene, totalFading } from "@/lib/explore/fading-words";
import { LAST_SCENE_KEY } from "@/lib/explore/last-scene";
import { SCENES } from "@/lib/explore/scenes";
import { objectiveProgress } from "@/lib/explore/story/objectives";
import { loadStory } from "@/lib/explore/story/story-state";
import type { Objective, StoryDifficulty } from "@/lib/explore/story/story-types";
import { CasePoster } from "./case-poster";
import { computeStamps, PassportView } from "./passport-view";
import { SceneThumb } from "./scene-thumb";
import { TownMap } from "./town-map";
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

type Tab = "map" | "passport" | "cases" | "scenes";

/**
 * Trang Khám phá gọn: hai thẻ chuyển (Phá án / Học từ theo cảnh), mỗi mục là một thẻ có ảnh thu nhỏ của cảnh, kèm tiến độ của bạn
 * (vụ án: số mục tiêu đã xong hoặc "Đã giải"; cảnh: số từ đã học).
 */
export function ExploreHub({ cases }: { cases: CaseSummary[] }) {
  const [tab, setTab] = useState<Tab>("map");
  const [caseState, setCaseState] = useState<Record<string, { done: number; solved: boolean }>>({});
  const [learned, setLearned] = useState<Record<string, number>>({});
  const [fading, setFading] = useState<Record<string, number>>({});
  const [lastScene, setLastScene] = useState<string | null>(null);
  const [progressAll, setProgressAll] = useState<ExploreProgress>(emptyProgress);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Tiến độ nằm ở localStorage (server không đọc được) nên đọc sau khi mount.
    const next: Record<string, { done: number; solved: boolean }> = {};
    for (const c of cases) {
      const p = loadStory(window.localStorage, c.id);
      next[c.id] = { done: objectiveProgress(c.objectives, p.flags).done, solved: p.flags.includes(c.solvedFlag) };
    }
    const progress = loadProgress(window.localStorage);
    const terms = Object.keys(progress.terms);
    const counts: Record<string, number> = {};
    // Chỉ tính từ còn trong cảnh (từ đã bỏ khỏi cảnh vẫn có thể còn trong dữ liệu cũ).
    for (const s of Object.values(SCENES)) counts[s.id] = s.objects.filter((o) => terms.includes(`${s.id}:${o.id}`)).length;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaseState(next);
    setLearned(counts);
    setFading(fadingByScene(progress, Object.values(SCENES), Date.now()));
    setLastScene(window.localStorage.getItem(LAST_SCENE_KEY));
    setProgressAll(progress);
    setNow(Date.now());
  }, [cases]);

  const tabCls = (on: boolean) => `min-h-11 flex-1 rounded-full px-4 text-label-md font-extrabold transition-colors ${on ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`;
  const card = "card-ink group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-0.5";

  return (
    <div className="flex flex-col gap-space-md">
      <div role="tablist" aria-label="Khám phá" className="flex gap-1 rounded-full border-2 border-ink bg-surface-container-lowest p-1">
        <button type="button" role="tab" aria-selected={tab === "map"} onClick={() => setTab("map")} className={tabCls(tab === "map")}>Bản đồ</button>
        <button type="button" role="tab" aria-selected={tab === "passport"} onClick={() => setTab("passport")} className={tabCls(tab === "passport")}>Hộ chiếu</button>
        <button type="button" role="tab" aria-selected={tab === "cases"} onClick={() => setTab("cases")} className={tabCls(tab === "cases")}>Phá án ({cases.length})</button>
        <button type="button" role="tab" aria-selected={tab === "scenes"} onClick={() => setTab("scenes")} className={tabCls(tab === "scenes")}>Học từ theo cảnh ({Object.keys(SCENES).length})</button>
      </div>

      <Link href="/explore/coop" className="card-ink flex items-center gap-space-sm bg-secondary-container p-space-sm text-on-secondary-container transition-transform hover:-translate-y-0.5">
        <span aria-hidden="true" className="text-3xl">🕵️‍♀️🕵️</span>
        <span className="min-w-0 flex-1">
          <span className="block text-label-lg font-extrabold">Phá án cùng bạn</span>
          <span className="block text-label-md">Hai người một vụ án, mỗi người một nửa số cảnh. Manh mối là riêng: báo nhau bằng tiếng Trung rồi cùng buộc tội. Thưởng XP x1,5.</span>
        </span>
        <span className="shrink-0 rounded-full bg-surface-container-lowest px-3 py-1.5 text-label-md font-extrabold text-secondary">Mời bạn</span>
      </Link>

      <Link href="/dialogues" className="card-ink flex items-center gap-space-sm bg-tertiary-container p-space-sm text-on-tertiary-container transition-transform hover:-translate-y-0.5">
        <span aria-hidden="true" className="text-3xl">💬</span>
        <span className="min-w-0 flex-1">
          <span className="block text-label-lg font-extrabold">Hội thoại</span>
          <span className="block text-label-md">Nghe từng câu, xem pinyin, đóng vai một bên và ghi âm giọng bạn. Có bài dài cho mỗi cảnh.</span>
        </span>
        <span className="shrink-0 rounded-full bg-surface-container-lowest px-3 py-1.5 text-label-md font-extrabold text-primary">Luyện nói</span>
      </Link>

      {totalFading(fading) > 0 && (
        <Link href={`/explore/${mostFadingScene(fading)}?rescue=1`} className="card-ink flex items-center gap-space-sm bg-primary-container p-space-sm text-on-primary-container transition-transform hover:-translate-y-0.5">
          <span aria-hidden="true" className="anim-float text-3xl">👻</span>
          <span className="min-w-0 flex-1">
            <span className="block text-label-lg font-extrabold">{totalFading(fading)} từ đang phai ở {Object.keys(fading).length} cảnh</span>
            <span className="block text-label-md">Chạm để vào cảnh phai nhiều nhất và cứu chúng bằng một lượt nhiệm vụ ngắn.</span>
          </span>
          <span className="shrink-0 rounded-full bg-surface-container-lowest px-3 py-1.5 text-label-md font-extrabold text-primary">Cứu ngay</span>
        </Link>
      )}

      {tab === "map" ? (
        <TownMap cases={cases} learned={learned} fading={fading} caseState={caseState} lastScene={lastScene} tiers={Object.fromEntries(Object.entries(computeStamps(progressAll, now)).map(([id, st]) => [id, st.tier]))} />
      ) : tab === "passport" ? (
        <PassportView progress={progressAll} now={now} lastScene={lastScene} />
      ) : tab === "cases" ? (
        <ul className="grid gap-space-sm sm:grid-cols-2">
          {cases.map((c) => {
            const st = caseState[c.id];
            return (
              <li key={c.id}>
                <Link href={`/explore/cases/${c.id}`} className={card}>
                  <div className="relative">
                    <CasePoster caseId={c.id} />
                    <span className="absolute left-2 top-2"><DifficultyBadge level={c.difficulty} /></span>
                    {st?.solved && <span className="absolute right-2 top-2 rounded-full border-2 border-ink bg-surface-container-lowest px-2.5 py-0.5 text-label-md font-extrabold text-primary">✓ Đã giải</span>}
                  </div>
                  <div className="flex-1 p-space-sm">
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
                <div className="flex-1 px-space-sm py-2">
                  <h2 className="text-label-lg font-extrabold leading-tight">{s.title}</h2>
                  <p className="text-label-md text-on-surface-variant">{learned[s.id] ?? 0}/{s.objects.length} từ đã học</p>
                  {fading[s.id] > 0 && <p className="mt-0.5 inline-block rounded-full bg-primary-container px-2 text-label-md font-extrabold text-on-primary-container">👻 {fading[s.id]} từ phai</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
