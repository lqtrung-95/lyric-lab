"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLikedSongs } from "@/components/library/use-liked-songs";
import { CompletedToast } from "./completed-toast";
import { Toast } from "@/components/ui/toast";
import type { AnalyzedLine, PreviewItem, SongAnalysis } from "@/lib/analysis/analysis-types";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { resolveShortcut } from "@/lib/listen/keyboard-shortcuts";
import { estimateSyncRisk, offsetFromLineClick, shiftLines } from "@/lib/listen/lyric-offset";
import { defaultRepeatConfig, type RepeatConfig } from "@/lib/listen/repeat-config";
import { buildPreviewView } from "@/lib/preview/build-preview-view";
import { itemKey, type CardSnapshot, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useLyricOffset } from "@/lib/user-state/use-lyric-offset";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { LineExplainSheet } from "./line-explain-sheet";
import { LinePracticeSheet } from "./line-practice-sheet";
import { PlaybackBar } from "./playback-bar";
import { ReportSongButton } from "@/components/preview/report-song-button";
import { SyncPanel } from "./sync-panel";
import { usePublishDefaultOffset } from "./use-publish-default-offset";
import { ListenTopBar } from "./listen-top-bar";
import { LyricList } from "./lyric-list";
import type { WordSelection } from "./lyric-line-row";
import { SingingPanel } from "./singing-panel";
import { useLineExplain } from "./use-line-explain";
import { useListenLineOnce } from "./use-listen-line-once";
import { usePlaybackSync } from "./use-playback-sync";
import { useSongProgress } from "./use-song-progress";
import { useTermLookup } from "./use-term-lookup";
import { WordPopover } from "./word-popover";

interface ListenScreenProps {
  analysis: SongAnalysis;
  song: { title: string; channelTitle: string; durationSec?: number };
  /** Giây để tua tới khi player sẵn sàng (tiếp tục bài nghe dở). */
  startAt?: number;
}

/** Màn Nghe (S5): video nhúng + lời chạy theo nhạc + panel "Đang hát". Mọi tô sáng dùng cùng bộ lọc level/"Đã biết" với màn xem trước. */
export function ListenScreen({ analysis, song, startAt }: ListenScreenProps) {
  const { offset, setOffset } = useLyricOffset(analysis.videoId);
  const resetOffset = useCallback(() => setOffset(0), [setOffset]);
  const publishOffset = usePublishDefaultOffset(analysis.videoId, offset, resetOffset);
  // Mọi thứ trong màn Nghe (đồng bộ, tô sáng, tua, lặp câu, tiến độ) dùng mốc đã cộng độ lệch người dùng chỉnh.
  const lines = useMemo(() => shiftLines(analysis.lines, offset), [analysis.lines, offset]);
  const syncRisk = useMemo(() => estimateSyncRisk(analysis.lines, song.durationSec ?? 0), [analysis.lines, song.durationSec]);
  const [quickSync, setQuickSync] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [pinToast, setPinToast] = useState<string | null>(null);
  // Video + thanh điều khiển dính ở đầu màn hình khi cuộn xuống đọc lời (mọi cỡ màn hình) — `data-sticky-player`
  // dùng để `LyricList` tính khoảng chừa phía trên khi tự cuộn theo câu đang hát.
  const stickyPlayerRef = useRef<HTMLDivElement>(null);
  const { containerRef, controller, failed } = useYouTubePlayer(analysis.videoId);
  const { prefs, update } = useListenPrefs();
  const learner = useLearnerState();
  const { liked, setLiked } = useLikedSongs();
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(defaultRepeatConfig);
  const [word, setWord] = useState<WordSelection | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  // Câu đang luyện phát âm: chụp lại lúc bấm mở, không đọc theo currentIndex sống nữa — nhạc chạy tiếp/đổi câu
  // trong lúc popup mở sẽ không làm mất nội dung đang luyện (khác lúc trước gắn thẳng vào panel "Đang hát").
  const [practiceLine, setPracticeLine] = useState<AnalyzedLine | null>(null);
  const onRepeatsExhausted = useCallback(() => setLoopIndex(null), []);
  const { currentIndex: liveIndex, playing, cancelPendingResume } = usePlaybackSync(controller, lines, loopIndex, repeatConfig, onRepeatsExhausted);
  // Trong lúc popup luyện phát âm đang mở, giữ nguyên hiển thị (tô sáng lời, cuộn, panel "Đang hát") ở đúng câu
  // đang luyện — không theo currentIndex sống nữa. Nghe 1 câu trong popup có thể khiến currentIndex thật sự đã lệch
  // sang câu kế (mốc kết thúc câu này thường trùng luôn mốc bắt đầu câu sau), nếu cứ theo currentIndex thì lời phía
  // sau sẽ tự nhảy câu ngay trong lúc người dùng còn đang xem popup của câu trước.
  const currentIndex = practiceLine ? practiceLine.index : liveIndex;
  const { result: explainResult, explain, reset: resetExplain } = useLineExplain(analysis.videoId);
  const { completed } = useSongProgress(analysis.videoId, lines, liveIndex);
  const lookup = useTermLookup(analysis.videoId, word);
  const wordItem = word?.itemId ? analysis.items.find((i) => i.id === word.itemId) ?? null : null;

  const known = useMemo(() => new Set(learner.state.known), [learner.state.known]);
  const savedKeys = useMemo(() => new Set(learner.state.saved.map((s) => s.key)), [learner.state.saved]);
  const view = useMemo(
    () => buildPreviewView(analysis.items, { userLevel: learner.state.level, known, levelFilter: "all", showEasy: false }),
    [analysis.items, learner.state.level, known],
  );
  const currentItems = useMemo(
    () => [...view.vocab, ...view.grammar].filter((i) => i.occurrences.some((o) => o.lineIndex === currentIndex)),
    [view, currentIndex],
  );

  useEffect(() => { controller?.setRate(prefs.rate); }, [controller, prefs.rate]);
  // Tiếp tục nghe: tua một lần tới chỗ đã dừng (không tự phát, người dùng bấm phát khi sẵn sàng).
  useEffect(() => { if (controller && startAt) controller.seekTo(startAt); }, [controller, startAt]);

  const seekToLine = useCallback((index: number) => {
    const line = lines[index];
    if (!controller || !line) return;
    controller.seekTo(line.start);
    controller.play();
    setLoopIndex((prev) => (prev === null ? prev : index));
  }, [controller, lines]);

  const listenLineOnce = useListenLineOnce(controller, lines);

  // Đồng bộ nhanh: bấm dòng đang được hát → độ lệch = thời gian video hiện tại − mốc gốc của dòng đó.
  const syncToLine = useCallback((index: number) => {
    const original = analysis.lines[index];
    if (!controller || !original) return;
    setOffset(offsetFromLineClick(controller.getCurrentTime(), original.start));
    setQuickSync(false);
  }, [controller, analysis.lines, setOffset]);

  const togglePlay = useCallback(() => {
    if (!controller) return;
    if (controller.isPlaying()) controller.pause();
    else controller.play();
  }, [controller]);

  const toggleLoop = useCallback(() => {
    setLoopIndex((prev) => (prev !== null ? null : currentIndex >= 0 ? currentIndex : 0));
  }, [currentIndex]);

  // Ghim/bỏ ghim không có phản hồi hiện lên ngay (chỉ đổi màu icon), dễ bị bỏ lỡ khi thao tác nhanh lúc đang nghe.
  const toggleAutoScroll = useCallback(() => {
    const nextAutoScroll = !prefs.autoScroll;
    update({ autoScroll: nextAutoScroll });
    setPinToast(nextAutoScroll ? "Đã bỏ ghim: lời tự cuộn theo câu đang hát" : "Đã ghim: lời sẽ không tự cuộn theo câu đang hát nữa");
  }, [prefs.autoScroll, update]);

  // Tạm dừng khi mở giải thích: đọc xong câu đang phát mà nhạc vẫn trôi tới câu khác thì nội dung không còn khớp.
  // Đóng popover tra từ nếu đang mở — cả hai đều là bottom sheet chiếm cùng vị trí, mở cùng lúc sẽ đè lên nhau.
  const openExplain = useCallback(() => {
    if (currentIndex < 0) return;
    controller?.pause();
    setWord(null);
    setExplainOpen(true);
    void explain(currentIndex);
  }, [currentIndex, explain, controller]);

  // Mở popup luyện phát âm cho câu đang hát: tạm dừng nhạc nền và chụp lại câu tại thời điểm bấm.
  const openPractice = useCallback(() => {
    if (currentIndex < 0) return;
    controller?.pause();
    setPracticeLine(lines[currentIndex]);
  }, [currentIndex, controller, lines]);

  // Bấm tra một từ trong lúc đang mở giải thích cả câu: đóng giải thích lại, ưu tiên tra từ (thao tác nhanh hơn).
  const selectWord = useCallback((selection: WordSelection) => {
    cancelPendingResume();
    controller?.pause();
    setExplainOpen(false);
    setWord(selection);
  }, [cancelPendingResume, controller]);

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

  const saveFromPanel = (item: PreviewItem) => {
    const occurrence = item.occurrences[0];
    const entry: SavedItem = {
      key: itemKey(item), videoId: analysis.videoId, type: item.type, term: item.term,
      lineIndex: occurrence?.lineIndex ?? 0, start: occurrence?.start ?? 0, savedAt: Date.now(),
      reading: item.reading, sinoViet: item.sinoViet, level: item.level, meaning: item.meaningInContext,
    };
    learner.toggleSaved(entry);
  };

  const saveWord = (term: string, snapshot: CardSnapshot) => {
    if (!word) return;
    const line = lines[word.lineIndex];
    learner.toggleSaved({
      key: itemKey({ type: "vocab", term }), videoId: analysis.videoId, type: "vocab", term,
      lineIndex: word.lineIndex, start: line?.start ?? 0, savedAt: Date.now(), ...snapshot,
    });
  };

  const title = analysis.track?.title ?? song.title;
  const artist = analysis.track?.artist ?? song.channelTitle;

  return (
    <>
      <h1 className="sr-only">Nghe: {analysis.track?.title ?? song.title}</h1>
      <ListenTopBar
        videoId={analysis.videoId} title={title} artist={artist} backHref={`/learn/${analysis.videoId}`}
        showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation}
        onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })}
        onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
        liked={liked.has(analysis.videoId)} onToggleLike={(v) => setLiked(analysis.videoId, v)}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-gutter py-space-lg pb-32 md:px-6 lg:grid-cols-12 lg:px-12 lg:pb-space-lg">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div ref={stickyPlayerRef} data-sticky-player className="sticky top-16 z-20 -mx-gutter bg-surface md:mx-0">
            <div ref={containerRef} className="aspect-video w-full overflow-hidden bg-inverse-surface md:rounded-xl [&_iframe]:h-full [&_iframe]:w-full" />
            <PlaybackBar
              controller={controller} durationSec={song.durationSec ?? 0} playing={playing} onTogglePlay={togglePlay}
              onSeekBy={(d) => controller?.seekTo(Math.max(0, controller.getCurrentTime() + d))}
              loopIndex={loopIndex} loopStart={loopIndex !== null ? lines[loopIndex]?.start ?? null : null} onToggleLoop={toggleLoop}
              rate={prefs.rate} onRate={(rate) => update({ rate })}
              offset={offset} onOffsetChange={setOffset}
              autoScroll={prefs.autoScroll} onToggleAutoScroll={toggleAutoScroll}
              repeatConfig={repeatConfig} onRepeatConfigChange={setRepeatConfig}
              onExplain={openExplain} explainDisabled={currentIndex < 0}
              onPractice={openPractice} practiceDisabled={currentIndex < 0}
            />
            {failed && (
              <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
                Không phát được video này (có thể chủ video tắt nhúng).{" "}
                <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${analysis.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
              </p>
            )}
          </div>
          <SyncPanel offset={offset} risk={syncRisk} quickSync={quickSync} onOffsetChange={setOffset} onToggleQuickSync={() => setQuickSync((q) => !q)}
            publish={publishOffset.canPublish ? { state: publishOffset.state, onPublish: publishOffset.publish } : undefined} />
          <ReportSongButton videoId={analysis.videoId} prominent />
          <LyricList
            videoId={analysis.videoId} promptVersion={analysis.promptVersion}
            lines={lines} currentIndex={currentIndex} vocab={view.vocab} grammar={view.grammar}
            showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation} autoScroll={prefs.autoScroll}
            onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })}
            onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })} onSeek={quickSync ? syncToLine : seekToLine} onWord={selectWord}
          />
          {completed && !toastDismissed && <CompletedToast videoId={analysis.videoId} onDismiss={() => setToastDismissed(true)} />}
          {pinToast && <Toast message={pinToast} onDismiss={() => setPinToast(null)} />}
        </div>
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <SingingPanel line={lines[currentIndex] ?? null} items={currentItems} savedKeys={savedKeys} onToggleSave={saveFromPanel} />
        </div>
      </div>
      {word && (
        <WordPopover
          word={word} item={wordItem} lookup={lookup}
          saved={savedKeys.has(itemKey({ type: "vocab", term: wordItem?.term ?? (lookup.entry?.ok && lookup.entry.value ? lookup.entry.value.term : word.term) }))}
          onClose={() => setWord(null)} onPlayLine={() => seekToLine(word.lineIndex)} onToggleSave={saveWord}
        />
      )}
      {explainOpen && currentIndex >= 0 && (
        <LineExplainSheet
          lineText={lines[currentIndex].text} linePinyin={lines[currentIndex].pinyin} result={explainResult}
          onClose={() => { setExplainOpen(false); resetExplain(); }}
        />
      )}
      {practiceLine && (
        <LinePracticeSheet
          line={practiceLine}
          onListenLine={() => listenLineOnce(practiceLine.index)}
          onPauseSong={() => controller?.pause()}
          onClose={() => setPracticeLine(null)}
        />
      )}
    </>
  );
}
