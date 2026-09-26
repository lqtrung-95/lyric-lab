import Image from "next/image";
import Link from "next/link";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { formatTimestamp, levelRangeLabel } from "@/lib/preview/preview-format";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";

interface PreviewHeaderProps {
  analysis: SongAnalysis;
  song: { title: string; channelTitle: string; durationSec: number };
  listenHref: string;
}

/** Phần đầu màn xem trước: ảnh bìa, tên bài, cảm xúc, tóm tắt, nút "Bắt đầu nghe". */
export function PreviewHeader({ analysis, song, listenHref }: PreviewHeaderProps) {
  const title = analysis.track?.title ?? song.title;
  const artist = analysis.track?.artist ?? song.channelTitle;
  const range = levelRangeLabel(analysis.items);

  return (
    <section className="bg-surface-container-low px-gutter py-space-lg shadow-sm md:px-6 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-space-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/app" className="hidden min-h-11 items-center gap-2 text-label-md text-on-surface-variant hover:text-primary md:inline-flex">
            <Icon name="arrow_back" size={18} />
            Trở về Trang chủ
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
              <Icon name="schedule" size={15} className="text-primary" />
              {formatTimestamp(song.durationSec)} · {analysis.lines.length} câu
            </span>
            {range && <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-secondary">{range}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="relative aspect-video w-full max-w-sm justify-self-center overflow-hidden rounded-xl bg-surface-container-high shadow-md lg:col-span-4 lg:justify-self-start">
            <Image src={videoThumbnailUrl(analysis.videoId)} alt="" fill sizes="(min-width:1024px) 33vw, 384px" className="object-cover" priority />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-8">
            <ul aria-label="Cảm xúc của bài" className="flex flex-wrap items-center gap-2">
              {analysis.moods.map((m) => (
                <li key={m} className="rounded-full bg-surface px-2.5 py-0.5 text-label-sm text-on-surface-variant">#{m}</li>
              ))}
              <li className="text-label-sm text-on-surface-variant">• {artist}</li>
            </ul>
            <h1 lang="zh" className="font-serif text-headline-lg-mobile tracking-tight text-on-surface md:text-headline-xl">{title}</h1>
            <p className="border-l-2 border-primary/40 pl-3 text-body-lg italic text-on-surface-variant">{analysis.summary}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={listenHref} className="hidden min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-tertiary md:inline-flex">
                <Icon name="play_arrow" filled size={18} />
                Bắt đầu nghe nhạc ({analysis.lines.length} câu)
              </Link>
              <Link href={listenHref} className="ml-auto inline-flex min-h-11 items-center gap-1 text-label-md text-on-surface-variant underline decoration-outline-variant underline-offset-4 hover:text-on-surface">
                Bỏ qua, nghe luôn
                <Icon name="chevron_right" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
