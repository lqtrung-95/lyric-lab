"use client";

import Image from "next/image";
import Link from "next/link";
import { formatTimestamp } from "@/lib/preview/preview-format";
import type { SearchSong } from "@/lib/search/search-types";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";
import { Spinner } from "@/components/ui/spinner";
import type { SongSearchState } from "./use-song-search";

function Row({ song, onPick }: { song: SearchSong; onPick: (videoId: string) => void }) {
  return (
    <li>
      <Link href={`/learn/${song.videoId}`} onClick={() => onPick(song.videoId)} className="flex min-h-14 items-center gap-3 rounded-xl p-2 hover:bg-surface-container-high">
        <span className="relative h-11 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
          <Image src={videoThumbnailUrl(song.videoId)} alt="" fill sizes="80px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span lang="zh" className="line-clamp-2 text-body-md font-medium text-on-surface">{song.title}</span>
          <span className="block truncate text-label-sm text-on-surface-variant">{song.channelTitle}{song.durationSec ? ` · ${formatTimestamp(song.durationSec)}` : ""}</span>
        </span>
      </Link>
    </li>
  );
}

function Group({ title, songs, onPick }: { title: string; songs: SearchSong[]; onPick: (videoId: string) => void }) {
  if (songs.length === 0) return null;
  return (
    <section aria-label={title} className="mt-2">
      <h3 className="px-2 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">{title}</h3>
      <ul>{songs.map((s) => <Row key={s.videoId} song={s} onPick={onPick} />)}</ul>
    </section>
  );
}

/** Kết quả tìm bài: nhóm "Đã có trong Lyric Lab" (học ngay) và "Trên YouTube". Lỗi tìm YouTube → nhắc dán link. */
export function SongSearchResults({ state, onPick }: { state: SongSearchState; onPick: (videoId: string) => void }) {
  if (state.status === "idle") return null;
  const box = "mt-space-sm rounded-2xl bg-surface-container-low p-2";
  if (state.status === "loading") return <p role="status" className={`${box} flex items-center gap-2 px-3 py-3 text-label-md text-on-surface-variant`}><Spinner size={16} /> Đang tìm bài hát…</p>;
  if (state.status === "error") return <p role="alert" className={`${box} px-3 py-3 text-label-md text-error`}>Chưa tìm được, hãy dán link YouTube của bài hát.</p>;
  const { library, youtube } = state.data;
  const empty = library.length === 0 && youtube.length === 0;
  return (
    <div className={box}>
      <Group title="Đã có trong Lyric Lab" songs={library} onPick={onPick} />
      <Group title="Trên YouTube" songs={youtube} onPick={onPick} />
      {state.status === "unavailable" && <p role="alert" className="px-3 py-2 text-label-md text-error">Chưa tìm được trên YouTube, hãy dán link YouTube của bài hát.</p>}
      {empty && state.status === "done" && <p role="status" className="px-3 py-3 text-label-md text-on-surface-variant">Không thấy bài nào khớp. Thử tên khác hoặc dán link YouTube.</p>}
    </div>
  );
}
