"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { videosOfChannel } from "@/lib/video/group-by-channel";
import { countByBand, filterAndSortVideos, videoBandForLevel, type BandId, type VideoSort } from "@/lib/video/video-level-filter";
import { useVideoList } from "./use-video-list";
import { VideoGrid } from "./video-grid";
import { VideoListFilters } from "./video-list-filters";

/** Trang một kênh: liệt kê MỌI video của kênh đó (trang Video chỉ hiện vài video đầu mỗi kênh), có lọc theo cấp HSK và sắp xếp như trang Video. */
export function ChannelVideosScreen({ channelTitle }: { channelTitle: string }) {
  const videos = useVideoList();
  const { state } = useLearnerState();
  const [band, setBand] = useState<BandId | null>(null);
  const [sort, setSort] = useState<VideoSort>("new");
  const ofChannel = useMemo(() => (Array.isArray(videos) ? videosOfChannel(videos, channelTitle) : []), [videos, channelTitle]);
  const counts = useMemo(() => countByBand(ofChannel), [ofChannel]);
  const shown = useMemo(() => filterAndSortVideos(ofChannel, band, sort), [ofChannel, band, sort]);
  const name = channelTitle || "Kênh khác";

  return (
    <div className="space-y-space-md">
      <header>
        <Link href="/video" className="inline-flex min-h-11 items-center text-label-md font-semibold text-primary hover:underline">← Tất cả video</Link>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{name}</h1>
        {Array.isArray(videos) && ofChannel.length > 0 && <p className="mt-1 text-body-lg text-on-surface-variant">{ofChannel.length} bài học</p>}
      </header>
      {videos === null ? (
        <ul role="status" aria-label="Đang tải video" className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <li key={i}><Skeleton className="aspect-video w-full" /><Skeleton className="mt-2 h-12 w-full" /></li>)}
        </ul>
      ) : videos === "error" ? (
        <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Chưa tải được danh sách video, thử lại sau nhé.</p>
      ) : ofChannel.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">
          Không có video nào của kênh này. <Link href="/video" className="font-semibold text-primary underline">Về danh sách video</Link>
        </p>
      ) : (
        <>
          <VideoListFilters counts={counts} total={ofChannel.length} band={band} onBand={setBand} sort={sort} onSort={setSort} suggested={videoBandForLevel(state.level)} />
          {shown.length === 0 ? (
            <p role="status" className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">
              Chưa có video ở mức này. <button type="button" onClick={() => setBand(null)} className="font-semibold text-primary underline">Xem tất cả video của kênh</button>
            </p>
          ) : <VideoGrid videos={shown} />}
        </>
      )}
    </div>
  );
}
