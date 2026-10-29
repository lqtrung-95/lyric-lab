"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ExploreProgress } from "@/lib/explore/explore-progress";
import { completedJourneys, JOURNEYS } from "@/lib/explore/journeys";
import { newScenesToday, nextDestination, passportSummary, sceneStamp, STAMP_LABELS, STAMP_MEDALS, type SceneStamp, type StampTier } from "@/lib/explore/passport";
import { SCENES } from "@/lib/explore/scenes";
import { SCENE_EMOJI, TOWN_DISTRICTS } from "@/lib/explore/town-layout";

const RING: Record<StampTier, string> = { 0: "#b9ad9c", 1: "#b9772f", 2: "#8f9bab", 3: "#e0a800" };
const TILT = [-4, 3, -2, 5, -5, 2];

/** Các dấu của mọi cảnh theo thời điểm `now`: dùng chung cho hộ chiếu và huy chương trên bản đồ. */
export function computeStamps(progress: ExploreProgress, now: number): Record<string, SceneStamp> {
  return Object.fromEntries(Object.values(SCENES).map((s) => [s.id, sceneStamp(s, progress, now)]));
}

function stampNote(st: SceneStamp): string {
  if (st.tier === 0) return "Chưa ghé";
  if (st.tier === 1) return `${st.learned}/${st.total} từ`;
  if (st.tier === 2) return st.faded > 0 ? `${st.faded} từ đang phai` : `${st.notYetCorrect} từ chưa đúng`;
  return "Đủ cả";
}
/** Việc cần làm để lên bậc kế tiếp (đọc cho trình đọc màn hình và tooltip). */
function nextStep(st: SceneStamp): string {
  if (st.tier === 0) return "Học một từ để đóng dấu Đã ghé.";
  if (st.tier === 1) return `Học thêm ${st.total - st.learned} từ để đóng dấu Thông thạo.`;
  if (st.tier === 2) return "Trả lời đúng mọi từ ở nhiệm vụ của cảnh, và cứu các từ đang phai, để lên Thổ địa.";
  return "Đã đạt Thổ địa.";
}

/**
 * "Hộ chiếu" của thị trấn Khám phá: danh hiệu theo số cảnh đã ghé, nhiệm vụ nhỏ hôm nay (ghé một cảnh mới), gợi ý điểm đến kế tiếp và dấu đóng của từng cảnh
 * (bậc đồng/bạc/vàng). Chỉ đọc tiến độ có sẵn; không có XP riêng.
 */
export function PassportView({ progress, now, lastScene }: { progress: ExploreProgress; now: number; lastScene: string | null }) {
  const scenes = useMemo(() => Object.values(SCENES), []);
  const stamps = useMemo(() => computeStamps(progress, now), [progress, now]);
  const sum = useMemo(() => passportSummary(scenes, stamps), [scenes, stamps]);
  const today = useMemo(() => newScenesToday(stamps, now), [stamps, now]);
  const journeysDone = useMemo(() => completedJourneys(progress), [progress]);
  const dest = useMemo(() => nextDestination(scenes, stamps, lastScene), [scenes, stamps, lastScene]);
  const destScene = dest ? SCENES[dest.sceneId] : null;
  const destStamp = dest ? stamps[dest.sceneId] : null;
  const reason = dest?.reason === "neighbor" ? `Đi tiếp từ ${lastScene ? SCENES[lastScene]?.title : "cảnh vừa ghé"} qua lối ra.` : dest?.reason === "next" ? "Cảnh chưa ghé đầu tiên trong thị trấn." : destStamp ? nextStep(destStamp) : "";

  return (
    <div className="flex flex-col gap-space-md">
      <section aria-label="Danh hiệu" className="card-ink flex flex-col gap-space-sm p-space-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-label-md font-bold text-on-surface-variant">Danh hiệu của bạn</p>
            <h2 className="text-headline-md">🛂 {sum.title}</h2>
          </div>
          <p className="text-label-lg font-extrabold">Đã ghé {sum.visited}/{sum.total} cảnh</p>
        </div>
        <ul aria-label="Số dấu theo bậc" className="flex flex-wrap gap-2 text-label-md font-bold">
          {([1, 2, 3] as StampTier[]).map((t) => <li key={t} className="rounded-full border-2 border-ink bg-surface-container-lowest px-3 py-0.5">{STAMP_MEDALS[t]} {STAMP_LABELS[t]}: {sum.byTier[t]}</li>)}
          <li className="rounded-full border-2 border-ink bg-surface-container-lowest px-3 py-0.5">🧳 Hành trình: {journeysDone}/{JOURNEYS.length}</li>
        </ul>
        {sum.next && (
          <div>
            <ProgressBar value={sum.visited} max={sum.next.at} label={`Tiến độ tới danh hiệu ${sum.next.name}`} size="sm" />
            <p className="mt-1 text-label-md text-on-surface-variant">Còn {sum.next.remaining} cảnh nữa để đạt “{sum.next.name}”.</p>
          </div>
        )}
        <p role="status" className={`rounded-xl px-3 py-2 text-body-md font-bold ${today > 0 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-low"}`}>
          {today > 0 ? `✓ Hôm nay bạn đã ghé ${today} cảnh mới. Giỏi lắm!` : "Nhiệm vụ hôm nay: ghé một cảnh mới và học ít nhất một từ ở đó."}
        </p>
      </section>

      {destScene && dest && (
        <Link href={`/explore/${destScene.id}`} className="card-ink flex items-center gap-space-sm bg-primary-container p-space-sm text-on-primary-container transition-transform hover:-translate-y-0.5">
          <span aria-hidden="true" className="text-3xl">{SCENE_EMOJI[destScene.id]}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-label-md font-bold">Điểm đến gợi ý</span>
            <span className="block text-label-lg font-extrabold">{destScene.title}</span>
            <span className="block text-label-md">{reason}</span>
          </span>
          <span className="shrink-0 rounded-full bg-surface-container-lowest px-3 py-1.5 text-label-md font-extrabold text-primary">Đi ngay</span>
        </Link>
      )}

      {TOWN_DISTRICTS.map((d) => (
        <section key={d.id} aria-label={d.name} className="rounded-2xl border-[3px] border-ink p-space-sm" style={{ background: d.ground }}>
          <h3 className="mb-2 flex items-center gap-1.5 text-label-lg font-extrabold text-[#4a2e1b]"><span aria-hidden="true" className="text-xl">{d.emoji}</span>{d.name}</h3>
          <ul className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {d.scenes.map((id, i) => {
              const s = SCENES[id];
              const st = stamps[id];
              if (!s || !st) return null;
              return (
                <li key={id}>
                  <Link href={`/explore/${id}`} aria-label={`${s.title}: dấu ${STAMP_LABELS[st.tier]}, ${st.learned}/${st.total} từ. ${nextStep(st)}`} title={nextStep(st)}
                    className="group flex min-h-11 flex-col items-center gap-0.5 rounded-xl text-center focus-visible:outline-2 focus-visible:outline-primary">
                    <span className={`relative flex size-16 items-center justify-center rounded-full bg-white/80 transition-transform group-hover:scale-105 ${st.tier === 0 ? "border-4 border-dashed" : "border-[5px]"}`}
                      style={{ borderColor: RING[st.tier], transform: st.tier > 0 ? `rotate(${TILT[i % TILT.length]}deg)` : undefined }}>
                      <span aria-hidden="true" className={`text-2xl ${st.tier === 0 ? "opacity-30 brightness-0" : ""}`}>{st.tier === 0 ? "?" : SCENE_EMOJI[id]}</span>
                      {st.tier > 0 && <span aria-hidden="true" className="absolute -bottom-2 -right-2 text-xl">{STAMP_MEDALS[st.tier]}</span>}
                    </span>
                    <span className="px-0.5 text-[11px] font-extrabold leading-tight text-[#4a2e1b]">{s.title}</span>
                    <span className="text-[10px] font-bold text-[#4a2e1b]/70">{stampNote(st)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
