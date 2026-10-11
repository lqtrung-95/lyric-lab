"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { pickTodayStudy } from "@/lib/home/today-plan";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useRecentSongs } from "./use-recent-songs";
import { useRecommendedSongs, useVideoSummaries } from "./use-home-data";

const KIND_LABEL = { video: "Video", song: "Bài hát" } as const;

/**
 * "Gợi ý học hôm nay": một video hoặc bài hát vừa sức với level của người học, đổi theo ngày. Cố ý KHÔNG nhắc số thẻ cần ôn và bài nghe dở: bảng "Hôm nay"
 * ngay bên cạnh đã hiện hai việc đó, nhắc lại ở đây chỉ làm trang rối. Gợi ý lấy từ dữ liệu sẵn có của trang chủ.
 */
export function TodayPlan() {
  const videos = useVideoSummaries();
  const { state } = useLearnerState();
  const { songs: recent } = useRecentSongs();
  const openedIds = useMemo(() => (recent === null ? null : recent.map((s) => s.videoId)), [recent]);
  const songs = useRecommendedSongs(state.level, openedIds);
  const dayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const ready = videos !== undefined && songs !== undefined;
  const pick = ready ? pickTodayStudy({ videos: videos ?? [], songs: songs ?? [], level: state.level, dayKey }) : null;
  if (ready && !pick) return null; // chưa có gì để gợi ý: không chiếm chỗ

  return (
    <section aria-labelledby="plan-heading" aria-busy={!ready} className="mt-space-md">
      <h2 id="plan-heading" className="sr-only">Gợi ý học hôm nay</h2>
      {!ready || !pick ? (
        <div role="status" className="h-[5.5rem] animate-pulse rounded-2xl bg-surface-container-high motion-reduce:animate-none">
          <span className="sr-only">Đang tìm gợi ý cho bạn…</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-surface-container-low p-space-md">
          <div className="min-w-0 flex-1">
            <p className="text-label-sm font-semibold uppercase tracking-wider text-secondary">Gợi ý học hôm nay</p>
            <p lang="zh" className="mt-0.5 line-clamp-1 text-body-lg text-on-surface">{pick.title}</p>
            <p className="text-label-md text-on-surface-variant">{[KIND_LABEL[pick.kind], pick.levelAvg !== null ? `HSK ~${pick.levelAvg.toFixed(1)}` : null, "vừa sức với bạn"].filter(Boolean).join(" · ")}</p>
          </div>
          <Link href={pick.href} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-container px-5 text-label-md font-semibold text-on-primary-container hover:bg-primary hover:text-on-primary">
            <Icon name="play_arrow" filled size={18} />Bắt đầu
          </Link>
        </div>
      )}
    </section>
  );
}
