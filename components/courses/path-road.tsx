"use client";

import { useEffect, useRef } from "react";
import { PetMini } from "@/components/pet/pet-mini";
import { Icon } from "@/components/ui/icon";
import { mapHeight, nodePositions, roadPath } from "@/lib/courses/path-geometry";
import { starsOf } from "@/lib/courses/unit-levels";
import type { MapUnit } from "./use-course-map";

const isDone = (u: MapUnit) => u.progress?.status === "completed";
/** Chặng học đã qua cấp 1 nhưng chưa đủ 5 cấp: màu nhạt + chấm tiến độ; chỉ đủ 5 cấp mới ✓ xanh đậm. Chặng ôn tổng hợp chỉ có 1 cấp nên xong là đủ. */
const isFull = (u: MapUnit) => isDone(u) && (u.kind !== "hsk" || starsOf(u.progress) >= 5);
const needsReview = (u: MapUnit) => isDone(u) && u.strength?.needsReview === true;
const reviewIcon = (u: MapUnit) => (u.kind === "final" ? "emoji_events" : "quiz");

/**
 * Bản đồ dạng đường đi: các chặng nằm trên con đường uốn lượn dọc xuống (đường vẽ bằng SVG, nét đứt). Chặng đã xong màu xanh rêu có dấu ✓, chặng tiếp theo to hơn có sao,
 * các chặng còn lại là số (KHÔNG khóa: chạm chặng nào cũng xem được). Chạm một nút để xem chi tiết chặng; tên chủ đề hiện ở chặng đầu của mỗi nhóm.
 */
export function PathRoad({ units, currentIdx, selectedIdx, onSelect }: { units: MapUnit[]; currentIdx: number; selectedIdx: number; onSelect: (idx: number) => void }) {
  const currentRef = useRef<HTMLLIElement | null>(null);
  // Mở bản đồ là cuộn tới chặng đang học (bản đồ HSK 4–6 dài hơn 15.000 px): chỉ một lần và chỉ khi chặng đó ở xa đầu trang; bỏ qua khi người dùng bật giảm chuyển động thì vẫn nhảy thẳng (không hoạt ảnh).
  useEffect(() => {
    if (currentIdx > 4) currentRef.current?.scrollIntoView({ block: "center" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- chỉ lúc mở bản đồ lần đầu
  const points = nodePositions(units.length);
  const height = mapHeight(units.length);
  return (
    <div className="relative" style={{ height }}>
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <path d={roadPath(points)} fill="none" stroke="var(--outline-variant)" strokeWidth={14} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={roadPath(points)} fill="none" stroke="var(--surface-container-lowest)" strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" vectorEffect="non-scaling-stroke" />
      </svg>
      <ol aria-label="Các chặng" className="absolute inset-0 m-0 list-none p-0">
        {units.map((u, i) => {
          const p = points[i];
          const done = isDone(u);
          const full = isFull(u);
          const stars = starsOf(u.progress);
          const current = u.idx === currentIdx;
          const selected = u.idx === selectedIdx;
          const review = u.kind !== "hsk";
          const size = current ? 72 : u.kind === "final" ? 68 : 56;
          const showTopic = u.topic && u.topic !== units[i - 1]?.topic;
          const labelRight = p.x < 50;
          return (
            <li key={u.id} ref={current ? currentRef : undefined} className="absolute" style={{ left: `${p.x}%`, top: p.y, transform: "translate(-50%, -50%)" }}>
              <button type="button" onClick={() => onSelect(u.idx)} aria-pressed={selected}
                aria-label={`${review ? "" : "Chặng "}${u.idx}: ${u.title}${done ? ", đã xong" : current ? ", chặng tiếp theo" : ""}${done && u.kind === "hsk" ? `, đã qua ${stars} trên 5 cấp` : ""}${needsReview(u) ? `, cần ôn (${u.strength!.fading} từ sắp quên)` : ""}`}
                style={{ width: size, height: size }}
                className={`relative flex items-center justify-center rounded-2xl border-[2.5px] border-ink text-body-lg font-black shadow-[0_4px_0_var(--shadow-ink)] transition-transform active:translate-y-1 active:shadow-none motion-reduce:transition-none ${full ? "bg-secondary text-on-secondary" : done ? "bg-secondary-container text-on-secondary-container border-secondary" : current ? "bg-primary-container text-on-primary-container" : review ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container-lowest text-on-surface"} ${selected ? "ring-[3px] ring-primary ring-offset-[3px] ring-offset-surface" : ""}`}>
                {done ? <Icon name="check" size={28} /> : current ? <Icon name="star" size={32} filled /> : review ? <Icon name={reviewIcon(u)} size={28} filled /> : u.idx}
                {done && u.kind === "hsk" && !full && <span aria-hidden="true" className="absolute left-1/2 top-full mt-2 flex -translate-x-1/2 gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-2 py-1 shadow-[0_2px_0_var(--shadow-ink)]">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`size-2.5 rounded-full border-[1.5px] border-ink ${n <= stars ? "bg-secondary" : "bg-surface-container-high"}`} />)}</span>}
                {full && u.kind === "hsk" && <span aria-hidden="true" className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-tertiary-container px-2 text-[11px] font-black leading-5 shadow-[0_2px_0_var(--shadow-ink)]">★★★★★</span>}
                {needsReview(u) && <span aria-hidden="true" title="Cần ôn" className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 border-ink bg-error-container"><Icon name="schedule" size={14} /></span>}
                {current && <span aria-hidden="true" className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-surface-container-lowest px-2 text-label-sm font-black">Đang học</span>}
              </button>
              {current && <span className={`absolute top-1/2 -translate-y-1/2 ${labelRight ? "right-full mr-2" : "left-full ml-2"}`}><PetMini className="size-12" /></span>}
              {showTopic && <span aria-hidden="true" className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-[var(--ink-soft)] bg-surface-container-lowest px-3 py-1 text-label-md font-extrabold text-on-surface-variant sm:block ${labelRight ? "left-full ml-3" : "right-full mr-3"}`}>{u.topic}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
