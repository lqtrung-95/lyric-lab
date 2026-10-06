"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { LinePracticeCard } from "@/components/listen/line-practice-card";
import { PLAYER_SIZE_CLASS } from "@/components/listen/player-size-class";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { alignPinyinToText } from "@/lib/rooms/align-pinyin";
import { dictationLines } from "@/lib/video/dictation";
import { lessonLinesToAnalyzed } from "@/lib/video/lesson-to-lines";
import type { LessonDetail } from "@/lib/video/video-repo";
import { useLineClip } from "./use-line-clip";
import { VideoModeNav } from "./video-mode-nav";

const SLOW_RATE = 0.75;

type Layer = "hanzi" | "pinyin" | "translation";
const LAYERS: { id: Layer; label: string }[] = [{ id: "hanzi", label: "Chữ Hán" }, { id: "pinyin", label: "Pinyin" }, { id: "translation", label: "Bản dịch" }];

/**
 * Shadowing theo video: lặp từng câu (nghe, phát chậm), ẩn bớt chữ Hán/pinyin/bản dịch để buộc tai làm việc, rồi nói theo, ghi âm và tự nghe lại
 * so với bản gốc. Ghi âm chỉ lưu tạm trong trình duyệt, không gửi đi và không chấm tự động. Khung video luôn hiện (điều khoản YouTube).
 */
export function VideoShadowingScreen({ lesson }: { lesson: LessonDetail }) {
  const lines = useMemo(() => lessonLinesToAnalyzed(dictationLines(lesson.lines)), [lesson.lines]);
  const { containerRef, controller, failed } = useYouTubePlayer(lesson.videoId);
  const { prefs } = useListenPrefs();
  const clip = useLineClip(controller);
  const [position, setPosition] = useState(0);
  const [slow, setSlow] = useState(false);
  const [hidden, setHidden] = useState<Set<Layer>>(new Set());
  const line = lines[position];

  const listen = useCallback(() => { if (line) clip.play(line.start, line.end, slow ? SLOW_RATE : 1); }, [clip, line, slow]);
  const pause = useCallback(() => { clip.stop(); controller?.pause(); }, [clip, controller]);
  const go = (to: number) => { pause(); setPosition(Math.min(lines.length - 1, Math.max(0, to))); };
  const toggleLayer = (l: Layer) => setHidden((h) => { const n = new Set(h); if (n.has(l)) n.delete(l); else n.add(l); return n; });

  if (lines.length === 0) {
    return <p role="status" className="mx-auto mt-space-xl max-w-md rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">Video này chưa có đủ câu để luyện nói.</p>;
  }

  const aligned = alignPinyinToText(line.text, line.pinyin);
  return (
    <>
      <h1 className="sr-only">Luyện nói theo: {lesson.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-gutter py-2 md:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/video/${lesson.videoId}`} aria-label="Về màn xem video" className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface-container-high md:flex"><Icon name="arrow_back" size={22} /></Link>
          <div className="min-w-0">
            <p lang="zh" className="truncate font-serif text-headline-md text-primary">{lesson.title}</p>
            <p className="truncate text-label-sm text-on-surface-variant">Luyện nói theo</p>
          </div>
        </div>
        <VideoModeNav videoId={lesson.videoId} current="shadowing" />
      </div>
      <div className="mx-auto flex max-w-2xl flex-col gap-space-md px-gutter py-space-lg pb-32 md:px-6">
        <div className={`mx-auto w-full ${PLAYER_SIZE_CLASS[prefs.playerSize === "large" ? "medium" : prefs.playerSize]}`}>
          <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-xl bg-inverse-surface [&_iframe]:h-full [&_iframe]:w-full" />
          {failed && (
            <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
              Không phát được video này.{" "}
              <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${lesson.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => go(position - 1)} disabled={position === 0} aria-label="Câu trước" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-40"><Icon name="arrow_back" size={20} /></button>
            <p className="min-w-24 text-center text-label-md font-semibold text-on-surface-variant">Câu {position + 1} / {lines.length}</p>
            <button type="button" onClick={() => go(position + 1)} disabled={position + 1 >= lines.length} aria-label="Câu sau" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-40"><Icon name="arrow_forward" size={20} /></button>
          </div>
          <button type="button" aria-pressed={slow} onClick={() => setSlow((s) => !s)} className={`min-h-11 rounded-full px-4 text-label-md font-medium ${slow ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface"}`}>Chậm {String(SLOW_RATE).replace(".", ",")}x</button>
        </div>

        <div role="group" aria-label="Ẩn bớt để luyện nghe" className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-label-md text-on-surface-variant">Hiện:</span>
          {LAYERS.map((l) => (
            <button key={l.id} type="button" aria-pressed={!hidden.has(l.id)} onClick={() => toggleLayer(l.id)}
              className={`min-h-11 rounded-full px-4 text-label-md font-medium ${hidden.has(l.id) ? "text-on-surface-variant hover:bg-surface-container" : "bg-surface-container-high text-on-surface"}`}>{l.label}</button>
          ))}
        </div>

        <section aria-label="Câu đang luyện" className="min-h-40 rounded-2xl bg-surface-container-low px-space-md py-space-lg text-center">
          {hidden.has("hanzi") && hidden.has("pinyin") ? (
            <p className="text-body-lg text-on-surface-variant">Đã ẩn chữ, hãy nghe thật kỹ rồi nói theo.</p>
          ) : (
            <p lang="zh" className="font-serif text-[1.75rem] leading-[2.1] text-on-surface md:text-[2.25rem]">
              {aligned
                ? aligned.map((c, i) => (c.py && !hidden.has("pinyin")
                  ? <ruby key={i} className="mx-0.5">{hidden.has("hanzi") ? "◯" : c.ch}<rt className="font-sans text-label-md font-normal tracking-wide text-on-surface-variant">{c.py}</rt></ruby>
                  : <span key={i}>{hidden.has("hanzi") && c.py ? "◯" : c.ch}</span>))
                : (hidden.has("hanzi") ? line.pinyin : line.text)}
            </p>
          )}
          {!hidden.has("translation") && line.translation && <p className="mt-1 text-body-md italic text-on-surface-variant">&ldquo;{line.translation}&rdquo;</p>}
        </section>

        <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
          {/* `key` đặt lại các bước và bản ghi mỗi khi sang câu khác. */}
          <LinePracticeCard key={line.index} line={line} variant="speech" onListenLine={listen} onPauseSong={pause} />
        </div>
      </div>
    </>
  );
}
