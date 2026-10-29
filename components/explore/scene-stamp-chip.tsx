"use client";

import { useEffect, useMemo, useState } from "react";
import { CelebrationBurst } from "@/components/courses/celebration-burst";
import type { ExploreProgress } from "@/lib/explore/explore-progress";
import { sceneStamp, STAMP_LABELS, STAMP_MEDALS, type SceneLike, type StampTier } from "@/lib/explore/passport";
import { sfx } from "@/lib/games/arcade-sfx";

const NEXT_HINT: Record<StampTier, string> = {
  0: "Học một từ để đóng dấu Đã ghé",
  1: "Học đủ từ để đóng dấu Thông thạo",
  2: "Trả lời đúng mọi từ ở nhiệm vụ để lên Thổ địa",
  3: "Bạn đã là Thổ địa của cảnh này",
};
const CELEBRATE_MS = 4500;

/**
 * Dấu của cảnh đang xem (ở đầu trang cảnh) và lời chúc mừng khi LÊN BẬC ngay trong lúc chơi (đóng dấu: tiếng + hiệu ứng, một lần).
 * Lần đầu có dữ liệu chỉ ghi nhớ bậc hiện tại, không chúc mừng, để vào lại cảnh cũ không "đóng dấu" lại.
 */
export function SceneStampChip({ scene, title, progress, now, ready }: { scene: SceneLike; title: string; progress: ExploreProgress; now: number; ready: boolean }) {
  const st = useMemo(() => sceneStamp(scene, progress, now), [scene, progress, now]);
  const [seen, setSeen] = useState<StampTier | null>(null);
  const [celebrate, setCelebrate] = useState<StampTier | null>(null);

  // Điều chỉnh state ngay lúc vẽ khi bậc đổi (lint cấm setState trực tiếp trong effect).
  if (ready && st.tier !== seen) {
    if (seen !== null && st.tier > seen) setCelebrate(st.tier);
    setSeen(st.tier);
  }
  useEffect(() => {
    if (!celebrate) return;
    sfx.petHappy();
    const id = setTimeout(() => setCelebrate(null), CELEBRATE_MS);
    return () => clearTimeout(id);
  }, [celebrate]);

  if (!ready) return null;
  return (
    <div className="relative">
      <p className="inline-flex flex-wrap items-center gap-x-2 rounded-full border-2 border-ink bg-surface-container-lowest px-3 py-1 text-label-md font-bold">
        <span aria-hidden="true">{st.tier > 0 ? STAMP_MEDALS[st.tier] : "🛂"}</span>
        <span>Dấu: {STAMP_LABELS[st.tier]}</span>
        <span className="font-medium text-on-surface-variant">· {st.learned}/{st.total} từ</span>
      </p>
      <p className="mt-0.5 text-label-md text-on-surface-variant">{NEXT_HINT[st.tier]}</p>
      {celebrate && (
        <div role="status" className="relative mt-1">
          <CelebrationBurst />
          <p className="inline-block rounded-full bg-primary-container px-3 py-1 text-label-lg font-extrabold text-on-primary-container">{STAMP_MEDALS[celebrate]} Đóng dấu {STAMP_LABELS[celebrate]} cho {title}!</p>
        </div>
      )}
    </div>
  );
}
