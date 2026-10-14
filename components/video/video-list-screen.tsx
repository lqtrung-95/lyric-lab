"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CHANNEL_PREVIEW_COUNT, channelHref, groupByChannel } from "@/lib/video/group-by-channel";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { countByBand, filterAndSortVideos, videoBandForLevel, type BandId, type VideoSort } from "@/lib/video/video-level-filter";
import { ChannelSeeAllCard } from "./channel-see-all-card";
import { useVideoList } from "./use-video-list";
import { VideoGrid } from "./video-grid";
import { VideoListFilters } from "./video-list-filters";

/**
 * Trang Video: các video luyện nghe đã được tuyển chọn, bấm vào để xem cùng bản chép và tra từ. Chế độ nhóm theo kênh (mặc định) liệt kê MỌI kênh nhưng mỗi kênh chỉ hiện vài video đầu
 * (`CHANNEL_PREVIEW_COUNT`) kèm thẻ "Xem tất cả" sang trang riêng của kênh (`/video/kenh/...`).
 */
export function VideoListScreen() {
  const videos = useVideoList();
  const { state } = useLearnerState();
  // Mặc định hiện TẤT CẢ (người mới không bị giấu video); dải hợp level chỉ được đánh dấu trên nút lọc.
  const [band, setBand] = useState<BandId | null>(null);
  const [sort, setSort] = useState<VideoSort>("new");
  const [grouped, setGrouped] = useState(true);
  const list = Array.isArray(videos) ? videos : null;
  const counts = useMemo(() => countByBand(list ?? []), [list]);
  const shown = useMemo(() => filterAndSortVideos(list ?? [], band, sort), [list, band, sort]);

  const groups = useMemo(() => (grouped ? groupByChannel(shown) : []), [grouped, shown]);

  return (
    <div className="space-y-space-md">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Video luyện nghe</h1>
        <p className="mt-1 text-body-lg text-on-surface-variant">Xem video tiếng Trung có phụ đề từng câu kèm pinyin và bản dịch. Bấm vào một từ để tra nghĩa và lưu vào bộ thẻ ôn.</p>
        <Link href="/video/add" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary-container px-5 text-label-md font-semibold text-on-primary-container hover:bg-primary hover:text-on-primary">Thêm video của bạn</Link>
      </header>
      {videos === null ? (
        <ul role="status" aria-label="Đang tải video" className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <li key={i}><Skeleton className="aspect-video w-full" /><Skeleton className="mt-2 h-12 w-full" /></li>)}
        </ul>
      ) : videos === "error" ? (
        <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Chưa tải được danh sách video, thử lại sau nhé.</p>
      ) : videos.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">Chưa có video nào. Quay lại sau nhé.</p>
      ) : (
        <>
          <VideoListFilters counts={counts} total={videos.length} band={band} onBand={setBand} sort={sort} onSort={setSort} suggested={videoBandForLevel(state.level)} grouped={grouped} onGrouped={setGrouped} />
          {shown.length === 0 ? (
            <p role="status" className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">
              Chưa có video ở mức này.{" "}
              <button type="button" onClick={() => setBand(null)} className="font-semibold text-primary underline">Xem tất cả video</button>
            </p>
          ) : grouped ? (
            <div className="space-y-space-lg">
              {groups.map((g) => (
                <section key={g.channelTitle} aria-label={`Kênh ${g.channelTitle}`}>
                  <h2 className="mb-3 font-serif text-headline-md">
                    {g.videos.length > CHANNEL_PREVIEW_COUNT
                      ? <Link href={channelHref(g.channelTitle === "Kênh khác" ? "" : g.channelTitle)} className="hover:underline">{g.channelTitle}</Link>
                      : g.channelTitle} <span className="text-label-md font-normal text-on-surface-variant">{g.videos.length} video</span>
                  </h2>
                  {g.videos.length > CHANNEL_PREVIEW_COUNT ? (
                    <VideoGrid videos={g.videos.slice(0, CHANNEL_PREVIEW_COUNT)} columns="lg:grid-cols-5"
                      extra={<ChannelSeeAllCard channelTitle={g.channelTitle === "Kênh khác" ? "" : g.channelTitle} total={g.videos.length} />} />
                  ) : <VideoGrid videos={g.videos} columns="lg:grid-cols-5" />}
                </section>
              ))}
            </div>
          ) : (
            <VideoGrid videos={shown} />
          )}
        </>
      )}
    </div>
  );
}
