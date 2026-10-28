"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useReviewSummary } from "./use-review-summary";
import { CARDS_MODE, REVIEW_GROUPS } from "./review-modes";
import { FluencyPanel } from "./fluency-panel";

/** Trang chủ Ôn & Nói: thẻ đến hạn nổi bật, rồi các chế độ gom theo mục đích (Nhớ từ, Nghe và đọc hiểu, Nói và phản xạ, Thi đấu), và chỉ số lưu loát. */
export function ReviewHub() {
  const due = useReviewSummary()?.total ?? 0;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-lg">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Ôn &amp; Nói</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Nhớ từ, nghe và đọc, rồi mở miệng nói. Mỗi nhóm bên dưới luyện một kỹ năng.</p>
      </header>
      <Link href={CARDS_MODE.href} className="card-ink flex items-center gap-space-md p-space-md hover:brightness-105">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><Icon name={CARDS_MODE.icon} size={26} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-label-lg font-extrabold">{due > 0 ? `Ôn ${due} thẻ đến hạn hôm nay` : "Ôn thẻ"}</span>
          <span className="block text-body-sm text-on-surface-variant">{CARDS_MODE.desc}</span>
        </span>
        <Icon name="chevron_right" size={24} />
      </Link>
      <FluencyPanel />
      {REVIEW_GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`grp-${g.id}`}>
          <h2 id={`grp-${g.id}`} className="text-label-lg font-extrabold">{g.title}</h2>
          <p className="text-body-sm text-on-surface-variant">{g.blurb}</p>
          <ul className="mt-2 grid auto-rows-fr gap-2 sm:grid-cols-2">
            {g.modes.map((m) => (
              <li key={m.href} className="flex">
                <Link href={m.href} className="flex min-h-16 w-full items-center gap-3 rounded-xl border-2 border-ink bg-surface-container-lowest p-space-sm hover:bg-surface-container-low">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name={m.icon} size={22} /></span>
                  <span className="min-w-0"><span className="block text-label-lg font-extrabold">{m.label}</span><span className="block text-body-sm text-on-surface-variant">{m.desc}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
