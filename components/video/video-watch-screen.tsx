"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { Toast } from "@/components/ui/toast";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { PLAYER_SIZE_CLASS } from "@/components/listen/player-size-class";
import { LyricList } from "@/components/listen/lyric-list";
import type { WordSelection } from "@/components/listen/lyric-line-row";
import { PlaybackBar } from "@/components/listen/playback-bar";
import { useTermLookup } from "@/components/listen/use-term-lookup";
import { usePlaybackSync } from "@/components/listen/use-playback-sync";
import { ViewToggles } from "@/components/listen/view-toggles";
import { WordPopover } from "@/components/listen/word-popover";
import { ReportVideoButton } from "./report-video-button";
import { VideoModeNav } from "./video-mode-nav";
import { ShortcutsHelpButton } from "@/components/listen/shortcuts-help-button";
import { useListenShortcuts } from "@/components/listen/use-listen-shortcuts";
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
  // Bản dịch AI vừa dịch lại sau khi người học báo sai: thay ngay trên màn này mà không cần tải lại bài.
  const [retranslated, setRetranslated] = useState<Record<number, string>>({});
  const lines = useMemo(() => lessonLinesToAnalyzed(lesson.lines).map((l) => (retranslated[l.index] ? { ...l, translation: retranslated[l.index] } : l)), [lesson.lines, retranslated]);
  const { containerRef, controller, failed } = useYouTubePlayer(lesson.videoId);
  const { prefs, update } = useListenPrefs();
  const learner = useLearnerState();
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(defaultRepeatConfig);
  const [word, setWord] = useState<WordSelection | null>(null);
  const [pinToast, setPinToast] = useState<string | null>(null);
  const [reportToast, setReportToast] = useState<string | null>(null);
  // Dòng đang chờ xác nhận báo sai: báo là AI dịch lại và bản mới hiện cho mọi người, nên hỏi lại để tránh bấm nhầm (nút cờ nằm cạnh nút chia sẻ).
  const [confirmReport, setConfirmReport] = useState<number | null>(null);
  const reporting = useRef(new Set<number>());
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
    setPinToast(next ? "Đã bỏ ghim: phụ đề tự cuộn theo câu đang phát" : "Đã ghim: phụ đề sẽ không tự cuộn theo câu đang phát nữa");
  }, [prefs.autoScroll, update]);

  const reportTranslation = useCallback(async (index: number) => {
    if (reporting.current.has(index)) return;
    reporting.current.add(index);
    setReportToast("Đang nhờ AI dịch lại câu này…");
    const post = () => fetch(`/api/videos/${lesson.videoId}/report-translation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lineIndex: index }) });
    try {
      await ensureAnonymousSession();
      let res = await post();
      if (res.status === 401 && (await ensureAnonymousSession())) res = await post();
      const data = (await res.json().catch(() => ({}))) as { kind?: string; translation?: string; error?: string };
      if (res.ok && data.kind === "retranslated" && data.translation) {
        setRetranslated((prev) => ({ ...prev, [index]: data.translation! }));
        setReportToast("Đã dịch lại câu này. Cảm ơn bạn đã báo!");
      } else if (res.ok && data.kind === "duplicate") setReportToast("Bạn đã báo câu này rồi.");
      else if (res.ok) setReportToast("Đã ghi nhận, quản trị viên sẽ xem lại bản dịch này.");
      else if (data.error === "user_limit") setReportToast("Hôm nay bạn đã báo nhiều rồi, mai báo tiếp nhé.");
      else setReportToast("Chưa gửi được báo cáo, thử lại sau nhé.");
    } catch {
      setReportToast("Chưa gửi được báo cáo, thử lại sau nhé.");
    } finally {
      reporting.current.delete(index);
    }
  }, [lesson.videoId]);

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

  const shortcuts = useMemo(() => ({
    togglePlay, toggleLoop,
    prevLine: () => seekToLine(Math.max(0, currentIndex - 1)),
    nextLine: () => seekToLine(Math.min(lines.length - 1, currentIndex + 1)),
    replayLine: () => { if (currentIndex >= 0) seekToLine(currentIndex); },
    togglePinyin: () => update({ showPinyin: !prefs.showPinyin }),
    toggleTranslation: () => update({ showTranslation: !prefs.showTranslation }),
  }), [togglePlay, toggleLoop, seekToLine, currentIndex, lines.length, update, prefs.showPinyin, prefs.showTranslation]);
  useListenShortcuts(shortcuts);

  const savedTerm = word ? (lookup.entry?.ok && lookup.entry.value ? lookup.entry.value.term : word.term) : "";

  return (
    <>
      <h1 className="sr-only">Video: {lesson.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-surface-container-low px-gutter py-2 md:px-6 lg:px-12">
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-3">
          <Link href="/video" aria-label="Về danh sách video" className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface-container-high md:flex"><Icon name="arrow_back" size={22} /></Link>
          <div className="min-w-0">
            <p lang="zh" title={lesson.title} className="truncate font-serif text-headline-md text-primary">{lesson.title}</p>
            <p className="truncate text-label-sm text-on-surface-variant">{lesson.channelTitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <VideoModeNav videoId={lesson.videoId} current="watch" />
          <ViewToggles compact
          className="hidden md:flex" showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation}
          onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })} onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
        />
          <ShortcutsHelpButton />
          <ReportVideoButton videoId={lesson.videoId} />
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
            onReplayLine={() => seekToLine(Math.max(0, currentIndex))}
            repeatConfig={repeatConfig} onRepeatConfigChange={setRepeatConfig}
          />
          {failed && (
            <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
              Không phát được video này.{" "}
              <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${lesson.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
            </p>
          )}
        </div>
        {lines.every((l) => !l.translation) && (
          <p role="note" className="rounded-xl bg-surface-container-low p-3 text-label-md text-on-surface-variant">
            Video này chưa có bản dịch tiếng Việt, sẽ được bổ sung sau. Bạn vẫn luyện chép chính tả và nói theo như bình thường.
          </p>
        )}
        <LyricList
          videoId={lesson.videoId} promptVersion="video" variant="speech"
          lines={lines} currentIndex={currentIndex} vocab={[]} grammar={[]}
          showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation} autoScroll={prefs.autoScroll}
          shareContext={{ title: lesson.title, artist: lesson.channelTitle }}
          onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })} onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
          onSeek={seekToLine} onWord={selectWord} onPauseSong={pause} onReportTranslation={setConfirmReport}
        />
        {pinToast && <Toast message={pinToast} onDismiss={() => setPinToast(null)} />}
        {reportToast && <Toast message={reportToast} onDismiss={() => setReportToast(null)} />}
        <ConfirmDialog
          open={confirmReport !== null} title="Báo bản dịch này sai?"
          body="AI sẽ dịch lại đúng câu này và bản mới hiện cho mọi người. Chỉ báo khi bản dịch hiện tại sai hoặc khó hiểu."
          confirmLabel="Báo và dịch lại" cancelLabel="Hủy"
          onCancel={() => setConfirmReport(null)}
          onConfirm={() => { const index = confirmReport; setConfirmReport(null); if (index !== null) void reportTranslation(index); }}
        />
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
