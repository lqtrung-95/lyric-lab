"use client";

import Link from "next/link";
import { useCourseMap, type MapUnit } from "@/components/courses/use-course-map";
import { useLastCourse } from "@/components/courses/use-last-course";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

const WINDOW = 5;

function Step({ slug, unit, current }: { slug: string; unit: MapUnit; current: boolean }) {
  const done = unit.progress?.status === "completed";
  return (
    <li className="flex flex-1 flex-col items-center gap-1">
      <Link href={`/courses/${slug}/${unit.idx}`} aria-label={`Chặng ${unit.idx}: ${unit.title}${done ? " (đã xong)" : current ? " (đang học)" : ""}`} aria-current={current ? "step" : undefined}
        className={`flex size-11 items-center justify-center rounded-full border-2 border-ink text-label-md font-extrabold shadow-[0_3px_0_var(--shadow-ink)] ${done ? "bg-secondary text-on-secondary" : current ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest text-on-surface"}`}>
        {done ? <Icon name="check" size={22} /> : current ? <Icon name="star" size={22} filled /> : unit.idx}
      </Link>
      <span className={`text-label-sm ${current ? "font-extrabold text-on-surface" : "text-on-surface-variant"}`}>Chặng {unit.idx}</span>
    </li>
  );
}

/** Giữ chỗ khi đang tải: cùng khung, tiêu đề, hàng 5 chặng và nút để không giật layout. */
function PathSkeleton() {
  return (
    <section aria-label="Đang tải lộ trình" aria-busy="true" className="card-ink flex h-full flex-col p-space-md">
      <div className="space-y-1.5"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-56 max-w-full" /></div>
      <div className="my-auto flex items-start justify-between gap-1 py-space-sm">
        {Array.from({ length: WINDOW }, (_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1"><Skeleton className="size-11 rounded-full" /><Skeleton className="h-3 w-10" /></div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </section>
  );
}

/** Thẻ lộ trình HSK 1 ở trang Hôm nay: chặng đang học và 5 chặng quanh nó (không khóa chặng nào), nút vào bản đồ. Dữ liệu công khai nên hiện được cả khi chưa có phiên. */
export function HomePathCard() {
  const slug = useLastCourse();
  const state = useCourseMap(slug);
  if (state.status === "loading") return <PathSkeleton />;
  if (state.status !== "ready" || state.units.length === 0) return null;
  const current = state.units.find((u) => u.progress?.status !== "completed") ?? state.units[state.units.length - 1];
  const done = state.units.filter((u) => u.progress?.status === "completed").length;
  const start = Math.max(0, Math.min(state.units.length - WINDOW, current.idx - 1 - Math.floor(WINDOW / 2)));
  const shown = state.units.slice(start, start + WINDOW);
  return (
    <section aria-labelledby="path-heading" className="card-ink flex h-full flex-col p-space-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id="path-heading" className="text-headline-md">Lộ trình {state.title}</h2>
          <p className="truncate text-body-md text-on-surface-variant">Chặng {current.idx}/{state.units.length}: {current.title}</p>
        </div>
        <Link href={`/courses?course=${slug}`} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-label-md font-extrabold text-primary hover:underline">Bản đồ <Icon name="chevron_right" size={18} /></Link>
      </div>
      {/* Thẻ cao bằng ô bên cạnh: cụm chặng + tiến độ nằm giữa phần còn dư, không để hở một khoảng trống. */}
      <div className="my-auto py-space-md">
        <ol className="flex items-start justify-between gap-1" aria-label="Các chặng gần đây">{shown.map((u) => <Step key={u.id} slug={slug} unit={u} current={u.idx === current.idx} />)}</ol>
        <div className="mt-space-md">
          <div className="flex items-center justify-between text-label-md text-on-surface-variant">
            <span>Đã hoàn thành</span>
            <span className="font-extrabold text-on-surface">{done}/{state.units.length} chặng</span>
          </div>
          <div role="progressbar" aria-label="Tiến độ lộ trình" aria-valuemin={0} aria-valuemax={state.units.length} aria-valuenow={done} className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-ink bg-surface-container">
            <div className="h-full bg-secondary" style={{ width: `${Math.max(2, (done / state.units.length) * 100)}%` }} />
          </div>
        </div>
      </div>
      <Link href={`/courses/${slug}/${current.idx}`} className="btn-3d btn-3d-bright w-full">{done === 0 && !current.progress ? "Bắt đầu chặng " : "Tiếp tục chặng "}{current.idx}</Link>
    </section>
  );
}
