"use client";

import Link from "next/link";
import { useCourseMap, type MapUnit } from "@/components/courses/use-course-map";
import { Icon } from "@/components/ui/icon";

const WINDOW = 5;

function Step({ unit, current }: { unit: MapUnit; current: boolean }) {
  const done = unit.progress?.status === "completed";
  return (
    <li className="flex flex-1 flex-col items-center gap-1">
      <Link href={`/hoc/hsk-1/${unit.idx}`} aria-label={`Chặng ${unit.idx}: ${unit.title}${done ? " (đã xong)" : current ? " (đang học)" : ""}`} aria-current={current ? "step" : undefined}
        className={`flex size-12 items-center justify-center rounded-full border-2 border-ink text-label-md font-extrabold shadow-[0_3px_0_var(--shadow-ink)] ${done ? "bg-secondary text-on-secondary" : current ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest text-on-surface"}`}>
        {done ? <Icon name="check" size={22} /> : current ? <Icon name="star" size={22} filled /> : unit.idx}
      </Link>
      <span className={`text-label-sm ${current ? "font-extrabold text-on-surface" : "text-on-surface-variant"}`}>Chặng {unit.idx}</span>
    </li>
  );
}

/** Thẻ lộ trình HSK 1 ở trang Hôm nay: chặng đang học và 5 chặng quanh nó (không khóa chặng nào), nút vào bản đồ. Dữ liệu công khai nên hiện được cả khi chưa có phiên. */
export function HomePathCard() {
  const state = useCourseMap("hsk-1");
  if (state.status !== "ready" || state.units.length === 0) return null;
  const current = state.units.find((u) => u.progress?.status !== "completed") ?? state.units[state.units.length - 1];
  const done = state.units.filter((u) => u.progress?.status === "completed").length;
  const start = Math.max(0, Math.min(state.units.length - WINDOW, current.idx - 1 - Math.floor(WINDOW / 2)));
  const shown = state.units.slice(start, start + WINDOW);
  return (
    <section aria-labelledby="path-heading" className="card-ink p-space-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id="path-heading" className="text-headline-md">Lộ trình {state.title}</h2>
          <p className="truncate text-body-md text-on-surface-variant">Chặng {current.idx}/{state.units.length}: {current.title}</p>
        </div>
        <Link href="/hoc" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-label-md font-extrabold text-primary hover:underline">Bản đồ <Icon name="chevron_right" size={18} /></Link>
      </div>
      <ol className="mt-space-md flex items-start justify-between gap-1" aria-label="Các chặng gần đây">{shown.map((u) => <Step key={u.id} unit={u} current={u.idx === current.idx} />)}</ol>
      <Link href={`/hoc/hsk-1/${current.idx}`} className="btn-3d btn-3d-bright mt-space-md w-full">{done === 0 && !current.progress ? "Bắt đầu chặng " : "Tiếp tục chặng "}{current.idx}</Link>
    </section>
  );
}
