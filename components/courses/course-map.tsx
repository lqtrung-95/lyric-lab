"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useCourseMap, type MapUnit } from "./use-course-map";

const isDone = (u: MapUnit) => u.progress?.status === "completed";

function UnitCard({ unit, slug, current }: { unit: MapUnit; slug: string; current: boolean }) {
  const done = isDone(unit);
  return (
    <li>
      <Link
        href={`/hoc/${slug}/${unit.idx}`}
        aria-current={current ? "step" : undefined}
        className={`flex min-h-16 items-center gap-space-sm rounded-2xl border p-space-sm transition-colors ${current ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container"}`}
      >
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-label-md font-semibold ${done ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}>
          {done ? <Icon name="check" size={22} /> : unit.idx}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-lg font-medium">{unit.title}</span>
          <span className={`block truncate text-body-sm ${current ? "" : "text-on-surface-variant"}`}>{unit.summary || `${unit.termCount} từ`}</span>
        </span>
        <span className="shrink-0 text-right text-label-md">
          {done ? <span>Đã xong · {unit.progress!.bestScore}%</span> : unit.progress ? <span>Đang học · {unit.progress.bestScore}%</span> : current ? <span>Bắt đầu</span> : null}
        </span>
      </Link>
    </li>
  );
}

/** Bản đồ lộ trình của một khóa: tiến độ chung, nút tiếp tục chặng đang học, danh sách chặng theo thứ tự (không khóa cứng, vào chặng nào cũng được). */
export function CourseMap({ slug }: { slug: string }) {
  const state = useCourseMap(slug);
  if (state.status === "loading") return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải lộ trình…</p>;
  if (state.status === "error") return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được lộ trình. Kiểm tra kết nối rồi tải lại trang nhé.</p>;

  const done = state.units.filter(isDone).length;
  const next = state.units.find((u) => !isDone(u));
  const percent = state.units.length ? Math.round((100 * done) / state.units.length) : 0;
  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Lộ trình {state.title}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Học từng chặng nhỏ: làm quen từ, nghe trong câu thật, rồi kiểm tra. Từ đã lưu sẽ vào bộ Ôn tập.</p>
      </header>
      <section aria-label="Tiến độ" className="rounded-2xl bg-surface-container-low p-space-md">
        <p className="text-body-md"><strong>{done}/{state.units.length}</strong> chặng đã xong</p>
        <div role="progressbar" aria-label="Tiến độ lộ trình" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        {next ? (
          <Link href={`/hoc/${slug}/${next.idx}`} className="mt-space-md inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">
            {done === 0 && !next.progress ? "Bắt đầu" : "Tiếp tục"} chặng {next.idx}: {next.title} <Icon name="arrow_forward" size={20} />
          </Link>
        ) : (
          <p className="mt-space-md text-body-lg font-medium text-primary">Bạn đã hoàn thành cả lộ trình. Giỏi lắm!</p>
        )}
      </section>
      <ol className="space-y-2" aria-label="Các chặng">
        {state.units.map((u) => <UnitCard key={u.id} unit={u} slug={slug} current={u.idx === next?.idx} />)}
      </ol>
    </div>
  );
}
