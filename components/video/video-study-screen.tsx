"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { PlaybackBar } from "@/components/listen/playback-bar";
import { ShortcutsHelpButton } from "@/components/listen/shortcuts-help-button";
import { ViewToggles } from "@/components/listen/view-toggles";
import { parseStudyTab, STUDY_TABS, studyTabHref, type StudyTab } from "@/lib/video/study-tab";
import type { LessonDetail } from "@/lib/video/video-repo";
import { ReportVideoButton } from "./report-video-button";
import { useVideoWatch } from "./use-video-watch";
import { VideoDictationPanel } from "./video-dictation-panel";
import { VideoShadowingPanel } from "./video-shadowing-panel";
import { VideoSubtitlesPanel } from "./video-subtitles-panel";

interface VideoStudyScreenProps {
  lesson: LessonDetail;
  startAt?: number;
  /** Giá trị `?tab=` của địa chỉ (đã có thể sai); tab hợp lệ mới được dùng. */
  initialTab?: string;
}

/**
 * Màn học một video, bố cục hai cột từ màn hình rộng: bên trái video + thanh điều khiển nằm cố định, bên phải ba tab (Phụ đề, Nghe – chép, Luyện nói)
 * dùng chung MỘT trình phát nên đổi tab không phải tải lại. Điện thoại xếp dọc: video dính ở trên cùng, tab ngay dưới. Tab đang mở được ghi lên
 * địa chỉ (`?tab=`) để chia sẻ và tải lại đúng chỗ.
 */
export function VideoStudyScreen({ lesson, startAt, initialTab }: VideoStudyScreenProps) {
  const [tab, setTab] = useState<StudyTab>(() => parseStudyTab(initialTab));
  const { containerRef, controller, failed } = useYouTubePlayer(lesson.videoId);
  const watch = useVideoWatch(lesson, controller, startAt, tab === "subtitles");
  const { prefs, update, stopLoop } = watch;

  const changeTab = useCallback((next: StudyTab) => {
    if (next === tab) return;
    // Mỗi tab tự điều khiển trình phát theo cách riêng: dừng tiếng và bỏ vòng lặp câu của tab Phụ đề để không tranh nhau.
    controller?.pause();
    stopLoop();
    setTab(next);
    try { window.history.replaceState(null, "", studyTabHref(lesson.videoId, next)); } catch { /* không ghi được địa chỉ: tab vẫn đổi bình thường */ }
  }, [controller, lesson.videoId, stopLoop, tab]);

  return (
    <>
      <h1 className="sr-only">Video: {lesson.title}</h1>
      <div className="bg-surface-container-low">
       <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-gutter py-2 md:px-6 lg:px-12">
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-3">
          <Link href="/video" aria-label="Về danh sách video" className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface-container-high md:flex"><Icon name="arrow_back" size={22} /></Link>
          <div className="min-w-0">
            <p lang="zh" title={lesson.title} className="truncate font-serif text-body-lg font-semibold leading-6 text-primary">{lesson.title}</p>
            <p className="truncate text-label-sm text-on-surface-variant">{lesson.channelTitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-0.5">
          {tab === "subtitles" && (
            <ViewToggles
              compact className="hidden md:flex" showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation}
              onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })} onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
            />
          )}
          <ShortcutsHelpButton />
          <ReportVideoButton videoId={lesson.videoId} />
        </div>
       </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-space-md px-gutter py-space-md pb-32 md:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-8 lg:px-12">
        <div data-sticky-player className="sticky top-16 z-20 -mx-gutter bg-surface lg:mx-0 lg:self-start">
          <div ref={containerRef} className="aspect-video w-full overflow-hidden bg-inverse-surface lg:rounded-xl [&_iframe]:h-full [&_iframe]:w-full" />
          {failed && (
            <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
              Không phát được video này.{" "}
              <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${lesson.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
            </p>
          )}
          {tab === "subtitles" && (
            <PlaybackBar
              controller={controller} durationSec={lesson.durationSec} playing={watch.playing} onTogglePlay={watch.togglePlay}
              onSeekBy={(d) => controller?.seekTo(Math.max(0, controller.getCurrentTime() + d))}
              loopIndex={watch.loopIndex} loopStart={watch.loopIndex !== null ? watch.lines[watch.loopIndex]?.start ?? null : null} onToggleLoop={watch.toggleLoop}
              rate={prefs.rate} onRate={(rate) => update({ rate })}
              autoScroll={prefs.autoScroll} onToggleAutoScroll={watch.toggleAutoScroll}
              onReplayLine={() => watch.seekToLine(Math.max(0, watch.currentIndex))}
              repeatConfig={watch.repeatConfig} onRepeatConfigChange={watch.setRepeatConfig}
            />
          )}
        </div>

        <div className="min-w-0">
          <div role="tablist" aria-label="Cách học video này" className="mb-space-md flex gap-1 border-b border-outline-variant/40">
            {STUDY_TABS.map((t) => (
              <button
                key={t.id} type="button" role="tab" id={`study-tab-${t.id}`} aria-selected={tab === t.id} aria-controls="study-panel" onClick={() => changeTab(t.id)}
                className={`-mb-px min-h-11 border-b-2 px-4 text-label-md font-semibold transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
              >{t.label}</button>
            ))}
          </div>
          <div role="tabpanel" id="study-panel" aria-labelledby={`study-tab-${tab}`}>
            {tab === "subtitles" && <VideoSubtitlesPanel lesson={lesson} watch={watch} />}
            {tab === "dictation" && <VideoDictationPanel lesson={lesson} controller={controller} />}
            {tab === "shadowing" && <VideoShadowingPanel lesson={lesson} controller={controller} />}
          </div>
        </div>
      </div>
    </>
  );
}
