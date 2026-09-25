"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreviewItem, SongAnalysis } from "@/lib/analysis/analysis-types";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { resolveShortcut } from "@/lib/listen/keyboard-shortcuts";
import { buildPreviewView } from "@/lib/preview/build-preview-view";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { ListenTopBar } from "./listen-top-bar";
import { LyricList } from "./lyric-list";
import { SingingPanel } from "./singing-panel";
import { TransportControls } from "./transport-controls";
import { usePlaybackSync } from "./use-playback-sync";

interface ListenScreenProps {
  analysis: SongAnalysis;
  song: { title: string; channelTitle: string };
}

/** Màn Nghe (S5): video nhúng + lời chạy theo nhạc + panel "Đang hát". Mọi tô sáng dùng cùng bộ lọc level/"Đã biết" với màn xem trước. */
export function ListenScreen({ analysis, song }: ListenScreenProps) {
  const { lines } = analysis;
  const { containerRef, controller, failed } = useYouTubePlayer(analysis.videoId);
  const { prefs, update } = useListenPrefs();
  const learner = useLearnerState();
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const { currentIndex, playing } = usePlaybackSync(controller, lines, loopIndex);

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

  const toggleLoop = useCallback(() => {
    setLoopIndex((prev) => (prev !== null ? null : currentIndex >= 0 ? currentIndex : 0));
  }, [currentIndex]);

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
    };
    learner.toggleSaved(entry);
  };

  const title = analysis.track?.title ?? song.title;
  const artist = analysis.track?.artist ?? song.channelTitle;

  return (
    <>
      <ListenTopBar
        title={title} artist={artist} backHref={`/learn/${analysis.videoId}`}
        showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation}
        onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })}
        onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-gutter py-space-lg pb-32 md:px-6 lg:grid-cols-12 lg:px-12 lg:pb-space-lg">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div data-sticky-player className="sticky top-16 z-20 -mx-gutter bg-surface md:mx-0">
            <div ref={containerRef} className="aspect-video w-full overflow-hidden bg-inverse-surface md:rounded-xl [&_iframe]:h-full [&_iframe]:w-full" />
            {failed && (
              <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
                Không phát được video này (có thể chủ video tắt nhúng).{" "}
                <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${analysis.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
              </p>
            )}
          </div>
          <TransportControls
            ready={!!controller} playing={playing} onTogglePlay={togglePlay}
            onSeekBy={(d) => controller?.seekTo(Math.max(0, controller.getCurrentTime() + d))}
            loopIndex={loopIndex} loopStart={loopIndex !== null ? lines[loopIndex]?.start ?? null : null} onToggleLoop={toggleLoop}
            rate={prefs.rate} onRate={(rate) => update({ rate })}
          />
          <LyricList
            lines={lines} currentIndex={currentIndex} vocab={view.vocab} grammar={view.grammar}
            showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation}
            onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })}
            onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })} onSeek={seekToLine}
          />
        </div>
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <SingingPanel line={lines[currentIndex] ?? null} items={currentItems} savedKeys={savedKeys} onToggleSave={saveFromPanel} />
        </div>
      </div>
    </>
  );
}
