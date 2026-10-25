"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PathRoad } from "./path-road";
import { UnitDetailCard } from "./unit-detail-card";
import { useCourseMap } from "./use-course-map";

/**
 * Bản đồ lộ trình dạng đường đi: thẻ tiến độ ở đầu (nút tiếp tục chặng đang học), con đường các chặng, và thẻ chi tiết chặng đang chọn
 * (cột bên phải trên màn rộng, dưới bản đồ trên điện thoại). Không khóa cứng: chạm chặng nào cũng vào được.
 */
export function CourseMap({ slug }: { slug: string }) {
  const state = useCourseMap(slug);
  const [picked, setPicked] = useState<number | null>(null);
  if (state.status === "loading") return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải lộ trình…</p>;
  if (state.status === "error") return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được lộ trình. Kiểm tra kết nối rồi tải lại trang nhé.</p>;

  const done = state.units.filter((u) => u.progress?.status === "completed").length;
  const next = state.units.find((u) => u.progress?.status !== "completed");
  const current = next ?? state.units[state.units.length - 1];
  const selected = state.units.find((u) => u.idx === (picked ?? current.idx)) ?? current;
  const percent = state.units.length ? Math.round((100 * done) / state.units.length) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-space-md">
      <header className="card-ink bg-primary-container p-space-md text-on-primary-container">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-surface-container-lowest text-on-surface"><Icon name="school" size={26} /></span>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">Lộ trình {state.title}</h1>
          </div>
          <p className="shrink-0 text-right text-label-md font-bold">Chặng xong<span className="block text-headline-lg-mobile font-black leading-none">{done}<span className="text-body-md font-bold">/{state.units.length}</span></span></p>
        </div>
        <p className="mt-2 text-body-md">Học từng chặng nhỏ: làm quen từ, nghe câu thật, rồi kiểm tra.</p>
        <div className="mt-space-sm"><ProgressBar value={done} max={state.units.length} label="Tiến độ lộ trình" tone="ink" /></div>
        <div className="mt-space-sm flex flex-wrap items-center justify-between gap-2">
          <p className="text-label-md font-bold">{percent}% hoàn thành</p>
          {next ? (
            <Link href={`/courses/${slug}/${next.idx}`} className="btn-3d">{done === 0 && !next.progress ? "Bắt đầu" : "Tiếp tục"} chặng {next.idx}: {next.title} <Icon name="arrow_forward" size={20} /></Link>
          ) : (
            <p className="text-body-lg font-extrabold">Bạn đã hoàn thành cả lộ trình!</p>
          )}
        </div>
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-space-md lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Bản đồ các chặng" className="card-ink overflow-hidden bg-surface-container-low px-2 py-space-md">
          <PathRoad units={state.units} currentIdx={current.idx} selectedIdx={selected.idx} onSelect={setPicked} />
        </section>
        <div className="lg:sticky lg:top-24 lg:self-start"><UnitDetailCard slug={slug} unit={selected} total={state.units.length} /></div>
      </div>
    </div>
  );
}
