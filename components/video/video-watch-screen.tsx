"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { Toast } from "@/components/ui/toast";
import { PLAYER_SIZE_CLASS } from "@/components/listen/player-size-class";
import { LyricList } from "@/components/listen/lyric-list";
import type { WordSelection } from "@/components/listen/lyric-line-row";
import { PlaybackBar } from "@/components/listen/playback-bar";
import { useTermLookup } from "@/components/listen/use-term-lookup";
import { usePlaybackSync } from "@/components/listen/use-playback-sync";
import { ViewToggles } from "@/components/listen/view-toggles";
import { WordPopover } from "@/components/listen/word-popover";
import { resolveShortcut } from "@/lib/listen/keyboard-shortcuts";
import { defaultRepeatConfig, type RepeatConfig } from "@/lib/listen/repeat-config";
import { itemKey, type CardSnapshot } from "@/lib/user-state/learner-state";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { lessonLinesToAnalyzed } from "@/lib/video/lesson-to-lines";
import type { LessonDetail } from "@/lib/video/video-repo";

/**
 * Màn xem video luyện nghe: video nhúng + bản chép chạy theo thời gian (cùng thành phần với màn Nghe bài hát) + bấm một từ để tra
 * (từ điển và nghĩa theo ngữ cảnh) rồi lưu vào bộ thẻ ôn. Video không có từ vựng/ngữ pháp được chọn trước, nên không có tô sáng
 * hay panel "Đang hát"; mọi từ chữ Hán đều bấm tra được.
 */
export function VideoWatchScreen({ lesson, startAt }: { lesson: LessonDetail; startAt?: number }) {
  const lines = useMemo(() => lessonLinesToAnalyzed(lesson.lines), [lesson.lines]);
  const { containerRef, controller, failed } = useYouTubePlayer(lesson.videoId);
  const { prefs, update } = useListenPrefs();
  const learner = useLearnerState();
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(defaultRepeatConfig);
  const [word, setWord] = useState<WordSelection | null>(null);
  const [pinToast, setPinToast] = useState<string | null>(null);
  const onRepeatsExhausted = useCallback(() => setLoopIndex(null), []);
  const { currentIndex, playing, cancelPendingResume } = usePlaybackSync(controller, lines, loopIndex, repeatConfig, onRepeatsExhausted);
  const lookup = useTermLookup(lesson.videoId, word);
  const savedKeys = useMemo(() => new Set(learner.state.saved.map((s) => s.key)), [learner.state.saved]);

  useEffect(() => { controller?.setRate(prefs.rate); }, [controller, prefs.rate]);
  useEffect(() => { if (controller && startAt) controller.seekTo(startAt); }, [controller, startAt]);

  const pause = useCallback(() => {
    cancelPendingResume();
    controller?.pause();
  }, [cancelPendingResume, controller]);

  const seekToLine = useCallback((index: number) => {
    const line = lines[index];
    if (!controller || !line) return;
    controller.seekTo(line.start);
    controller.play();
    setLoopIndex((prev) => (prev === null ? prev : index));
  }, [controller, lines]);

  const togglePlay = useCallback(() => {
    if (!controller) return;
    if (controller.isPlaying()) controller.pause();
    else controller.play();
  }, [controller]);

  const toggleLoop = useCallback(() => setLoopIndex((prev) => (prev !== null ? null : currentIndex >= 0 ? currentIndex : 0)), [currentIndex]);

  const toggleAutoScroll = useCallback(() => {
    const next = !prefs.autoScroll;
    update({ autoScroll: next });
    setPinToast(next ? "Đã bỏ ghim: bản chép tự cuộn theo câu đang phát" : "Đã ghim: bản chép sẽ không tự cuộn theo câu đang phát nữa");
  }, [prefs.autoScroll, update]);

  const selectWord = useCallback((selection: WordSelection) => {
    pause();
    setWord(selection);
  }, [pause]);

  const saveWord = (term: string, snapshot: CardSnapshot) => {
    if (!word) return;
    learner.toggleSaved({
      key: itemKey({ type: "vocab", term }), videoId: lesson.videoId, type: "vocab", term,
      lineIndex: word.lineIndex, start: lines[word.lineIndex]?.start ?? 0, savedAt: Date.now(), ...snapshot,
    });
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const action = resolveShortcut({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, target: e.target as HTMLElement | null });
      if (!action) return;
      e.preventDefault();
      if (action === "togglePlay") togglePlay();
      else if (action === "toggleLoop") toggleLoop();
      else if (action === "prevLine") seekToLine(Math.max(0, currentIndex - 1));
      else seekToLine(Math.min(lines.length - 1, currentIndex + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleLoop, seekToLine, currentIndex, lines.length]);

  const savedTerm = word ? (lookup.entry?.ok && lookup.entry.value ? lookup.entry.value.term : word.term) : "";

  return (
    <>
      <h1 className="sr-only">Video: {lesson.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-gutter py-2 md:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/video" aria-label="Về danh sách video" className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface-container-high md:flex"><Icon name="arrow_back" size={22} /></Link>
          <div className="min-w-0">
            <p lang="zh" className="truncate font-serif text-headline-md text-primary">{lesson.title}</p>
            <p className="truncate text-label-sm text-on-surface-variant">{lesson.channelTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/video/${lesson.videoId}/shadowing`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-high px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest">
            <Icon name="mic" size={18} /> Luyện nói
          </Link>
          <Link href={`/video/${lesson.videoId}/dictation`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container">
            <Icon name="edit" size={18} /> Chép chính tả
          </Link>
          <ViewToggles
          className="hidden md:flex" showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation}
          onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })} onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
        />
        </div>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-gutter py-space-lg pb-32 md:px-6">
        <div data-sticky-player className="sticky top-16 z-20 -mx-gutter bg-surface md:mx-0">
          <div ref={containerRef} className={`mx-auto aspect-video w-full overflow-hidden bg-inverse-surface md:rounded-xl [&_iframe]:h-full [&_iframe]:w-full ${PLAYER_SIZE_CLASS[prefs.playerSize]}`} />
          <PlaybackBar
            controller={controller} durationSec={lesson.durationSec} playing={playing} onTogglePlay={togglePlay}
            onSeekBy={(d) => controller?.seekTo(Math.max(0, controller.getCurrentTime() + d))}
            loopIndex={loopIndex} loopStart={loopIndex !== null ? lines[loopIndex]?.start ?? null : null} onToggleLoop={toggleLoop}
            rate={prefs.rate} onRate={(rate) => update({ rate })}
            autoScroll={prefs.autoScroll} onToggleAutoScroll={toggleAutoScroll}
            repeatConfig={repeatConfig} onRepeatConfigChange={setRepeatConfig}
          />
          {failed && (
            <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
              Không phát được video này.{" "}
              <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${lesson.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
            </p>
          )}
        </div>
        <LyricList
          videoId={lesson.videoId} promptVersion="video" variant="speech"
          lines={lines} currentIndex={currentIndex} vocab={[]} grammar={[]}
          showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation} autoScroll={prefs.autoScroll}
          onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })} onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
          onSeek={seekToLine} onWord={selectWord} onPauseSong={pause}
        />
        {pinToast && <Toast message={pinToast} onDismiss={() => setPinToast(null)} />}
      </div>
      {word && (
        <WordPopover
          word={word} item={null} lookup={lookup} saved={savedKeys.has(itemKey({ type: "vocab", term: savedTerm }))}
          onClose={() => setWord(null)} onPlayLine={() => seekToLine(word.lineIndex)} onToggleSave={saveWord}
        />
      )}
    </>
  );
}
