"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { useReviewSummaryState } from "@/components/review/use-review-summary";
import { pickTodayStudy } from "@/lib/home/today-plan";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useRecentSongs } from "./use-recent-songs";
import { useContinueSong, useRecommendedSongs, useVideoSummaries } from "./use-home-data";

const KIND_LABEL = { continue: "Nghe dở", video: "Video", song: "Bài hát" } as const;
const row = "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-surface-container-low p-space-md";
const action = "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-label-md font-semibold";

/**
 * "Lộ trình hôm nay": đúng hai việc nhỏ cho người học khỏi phải chọn: ôn thẻ đến hạn, và một bài hát hoặc video vừa sức với level của họ
 * (đổi theo ngày; bài đang nghe dở thì ưu tiên tiếp tục). Các gợi ý lấy từ dữ liệu sẵn có của trang chủ, không có thêm máy chủ riêng.
 */
export function TodayPlan() {
  const { summary, loaded } = useReviewSummaryState();
  const continueSong = useContinueSong();
  const videos = useVideoSummaries();
  const { state } = useLearnerState();
  const { songs: recent } = useRecentSongs();
  const openedIds = useMemo(() => (recent === null ? null : recent.map((s) => s.videoId)), [recent]);
  const songs = useRecommendedSongs(state.level, openedIds);
  const dayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const ready = loaded && continueSong !== undefined && videos !== undefined && songs !== undefined;
  const due = summary?.total ?? 0;
  const pick = ready ? pickTodayStudy({ continueSong: continueSong ?? null, videos: videos ?? [], songs: songs ?? [], level: state.level, dayKey }) : null;

  return (
    <section aria-labelledby="plan-heading" aria-busy={!ready} className="mt-space-md">
      <h2 id="plan-heading" className="font-serif text-headline-md text-on-surface">Lộ trình hôm nay</h2>
      {!ready ? (
        <div role="status" className="mt-space-sm grid gap-space-sm md:grid-cols-2">
          <span className="sr-only">Đang chuẩn bị lộ trình…</span>
          {[0, 1].map((i) => <div key={i} aria-hidden="true" className="h-[5.5rem] animate-pulse rounded-2xl bg-surface-container-high motion-reduce:animate-none" />)}
        </div>
      ) : (
        <ol className="mt-space-sm grid gap-space-sm md:grid-cols-2">
          <li className={row}>
            <div className="min-w-0">
              <p className="text-label-sm font-semibold uppercase tracking-wider text-secondary">1 · Ôn tập</p>
              {due > 0 ? (
                <p className="mt-0.5 text-body-lg text-on-surface"><strong>{due}</strong> thẻ đến hạn ôn</p>
              ) : (
                <p className="mt-0.5 text-body-md text-on-surface-variant">Chưa có thẻ nào đến hạn. Lưu thêm từ khi nghe để có thẻ ôn.</p>
              )}
            </div>
            {due > 0 && <Link href="/review" className={`${action} bg-primary text-on-primary hover:bg-primary-container`}><Icon name="style" size={18} />Bắt đầu ôn</Link>}
          </li>
          <li className={row}>
            <div className="min-w-0 flex-1">
              <p className="text-label-sm font-semibold uppercase tracking-wider text-secondary">2 · {pick?.kind === "continue" ? "Tiếp tục nghe" : "Học một bài vừa sức"}</p>
              {pick ? (
                <>
                  <p lang="zh" className="mt-0.5 line-clamp-1 text-body-lg text-on-surface">{pick.title}</p>
                  <p className="text-label-md text-on-surface-variant">{[KIND_LABEL[pick.kind], pick.levelAvg !== null ? `HSK ~${pick.levelAvg.toFixed(1)}` : null].filter(Boolean).join(" · ")}</p>
                </>
              ) : (
                <p className="mt-0.5 text-body-md text-on-surface-variant">Dán một link YouTube ở trên để bắt đầu bài đầu tiên.</p>
              )}
            </div>
            {pick && <Link href={pick.href} className={`${action} bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary`}><Icon name="play_arrow" filled size={18} />{pick.kind === "continue" ? "Tiếp tục" : "Bắt đầu"}</Link>}
          </li>
        </ol>
      )}
    </section>
  );
}
