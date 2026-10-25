"use client";

import Link from "next/link";
import { wordLabel } from "@/lib/courses/build-unit-quiz";
import { playChinese } from "@/lib/speech/play-chinese";
import { Icon } from "@/components/ui/icon";
import type { MapUnit } from "./use-course-map";
import { useUnit } from "./use-unit";

const FOCUS_WORDS = 4;

/** Thẻ chi tiết chặng đang chọn trên bản đồ: tên, mô tả, số từ, vài chữ Hán tiêu điểm (chạm để nghe) và nút vào chặng. Tải nội dung chặng từ API công khai khi được chọn. */
export function UnitDetailCard({ slug, unit, total }: { slug: string; unit: MapUnit; total: number }) {
  return unit.kind === "hsk" ? <HskUnitCard slug={slug} unit={unit} total={total} /> : <ReviewUnitCard slug={slug} unit={unit} total={total} />;
}

/** Chặng ôn tổng hợp: không có từ riêng nên chỉ nói rõ bài gồm gì (không gọi API để khỏi tải mẫu từ khi chỉ đang xem bản đồ). */
function ReviewUnitCard({ slug, unit, total }: { slug: string; unit: MapUnit; total: number }) {
  const done = unit.progress?.status === "completed";
  const final = unit.kind === "final";
  return (
    <section aria-labelledby="unit-detail-heading" className="card-ink p-space-md">
      <p className="inline-block rounded-full border-2 border-ink bg-tertiary-container px-3 py-0.5 text-label-sm font-black uppercase tracking-wide text-on-tertiary-container">{final ? "Kiểm tra cuối cấp" : "Ôn tập"} · {unit.idx}/{total}</p>
      <h2 id="unit-detail-heading" className="mt-2 text-headline-md">{unit.title}</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">{final ? "40 câu tổng hợp từ toàn bộ khóa: chữ→nghĩa, nghe chọn chữ, chọn pinyin, điền chỗ trống từ câu thật." : "20 câu ôn lại các từ của nhóm chặng vừa học, trộn nhiều kiểu câu hỏi."} Đạt từ 70% là hoàn thành. Từ làm sai tự vào bộ thẻ ôn.</p>
      <Link href={`/courses/${slug}/${unit.idx}`} className="btn-3d btn-3d-bright mt-space-md w-full text-body-lg">
        <Icon name={done ? "replay" : "play_arrow"} filled size={22} />{done ? "Làm lại bài" : "Làm bài"}
      </Link>
      {unit.progress && <p className="mt-2 text-center text-label-md font-bold text-on-surface-variant">{done ? "Đã hoàn thành" : "Đang làm"} · điểm cao nhất {unit.progress.bestScore}%</p>}
    </section>
  );
}

function HskUnitCard({ slug, unit, total }: { slug: string; unit: MapUnit; total: number }) {
  const state = useUnit(slug, unit.idx);
  const done = unit.progress?.status === "completed";
  const words = state.status === "ready" ? state.detail.words.slice(0, FOCUS_WORDS) : [];
  const examples = state.status === "ready" ? state.detail.words.filter((w) => w.examples.length > 0).length : 0;
  return (
    <section aria-labelledby="unit-detail-heading" className="card-ink p-space-md">
      <p className="inline-block rounded-full border-2 border-ink bg-primary-container px-3 py-0.5 text-label-sm font-black uppercase tracking-wide text-on-primary-container">Chặng {unit.idx}/{total}</p>
      <h2 id="unit-detail-heading" className="mt-2 text-headline-md">{unit.title}</h2>
      {unit.topic && <p className="text-body-md text-on-surface-variant">Chủ đề: {unit.topic}</p>}
      <dl className="mt-space-sm grid grid-cols-2 gap-2 text-body-md">
        <div className="rounded-xl bg-surface-container-low p-space-sm"><dt className="text-label-md text-on-surface-variant">Từ vựng</dt><dd className="text-headline-md">{unit.termCount}</dd></div>
        <div className="rounded-xl bg-surface-container-low p-space-sm"><dt className="text-label-md text-on-surface-variant">Câu thật từ video</dt><dd className="text-headline-md">{state.status === "ready" ? examples : "…"}</dd></div>
      </dl>
      <h3 className="mt-space-md text-label-md font-extrabold uppercase tracking-wide text-on-surface-variant">Chữ Hán tiêu điểm</h3>
      {state.status === "loading" && <p role="status" className="mt-2 text-body-md text-on-surface-variant">Đang tải…</p>}
      {state.status === "error" && <p role="alert" className="mt-2 text-body-md text-error">Chưa tải được chi tiết chặng.</p>}
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {words.map((w) => (
          <li key={w.term}>
            <button type="button" onClick={() => void playChinese(w.term)} aria-label={`Nghe ${w.term}, ${w.pinyin}, ${wordLabel(w)}`} className="flex min-h-24 w-full flex-col items-center justify-center rounded-xl border-2 border-[var(--ink-soft)] bg-surface-container-lowest p-2 shadow-[0_3px_0_var(--shadow-ink)] active:translate-y-[3px] active:shadow-none">
              <span lang="zh-Hans" className="text-3xl font-black leading-none">{w.term}</span>
              <span className="mt-1 text-label-md font-bold text-primary">{w.pinyin}</span>
              <span className="line-clamp-1 text-label-sm text-on-surface-variant">{wordLabel(w)}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link href={`/courses/${slug}/${unit.idx}`} className="btn-3d btn-3d-bright mt-space-md w-full text-body-lg">
        <Icon name={done ? "replay" : "play_arrow"} filled size={22} />{done ? `Học lại chặng ${unit.idx}` : unit.progress ? `Tiếp tục chặng ${unit.idx}` : `Vào chặng ${unit.idx}`}
      </Link>
      {unit.progress && <p className="mt-2 text-center text-label-md font-bold text-on-surface-variant">{done ? "Đã hoàn thành" : "Đang học"} · điểm cao nhất {unit.progress.bestScore}%</p>}
    </section>
  );
}
