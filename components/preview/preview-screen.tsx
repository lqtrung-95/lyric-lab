"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AnalyzedLine, PreviewItem, SongAnalysis } from "@/lib/analysis/analysis-types";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { Icon } from "@/components/ui/icon";
import { buildPreviewView, type LevelFilter } from "@/lib/preview/build-preview-view";
import { displayTermForm, snippetRange } from "@/lib/preview/preview-format";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { GrammarCard } from "./grammar-card";
import { LevelFilterBar } from "./level-filter-bar";
import { PreviewHeader } from "./preview-header";
import { VocabCard } from "./vocab-card";

const DEFAULT_VOCAB_SHOWN = 12;

interface PreviewScreenProps {
  analysis: SongAnalysis;
  song: { title: string; channelTitle: string; durationSec: number };
}

/** Màn Xem trước (S4): mọi lọc/"Đã biết"/"Lưu" tính lại trên dữ liệu đã có, không gọi AI. */
export function PreviewScreen({ analysis, song }: PreviewScreenProps) {
  const { state, markKnown, unmarkKnown, toggleSaved } = useLearnerState();
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [showEasy, setShowEasy] = useState(false);
  const [showAllVocab, setShowAllVocab] = useState(false);
  const [lastKnown, setLastKnown] = useState<{ key: string; label: string } | null>(null);
  const [snippet, setSnippet] = useState<SnippetRequest | null>(null);

  const known = useMemo(() => new Set(state.known), [state.known]);
  const savedKeys = useMemo(() => new Set(state.saved.map((s) => s.key)), [state.saved]);
  const view = useMemo(
    () => buildPreviewView(analysis.items, { userLevel: state.level, known, levelFilter, showEasy }),
    [analysis.items, state.level, known, levelFilter, showEasy],
  );
  const activeFilter = view.chips.some((c) => c.key === levelFilter) ? levelFilter : "all";
  const listenHref = `/learn/${analysis.videoId}/listen`;
  const vocabShown = showAllVocab ? view.vocab : view.vocab.slice(0, DEFAULT_VOCAB_SHOWN);

  const play = (item: PreviewItem, line: AnalyzedLine) => {
    const { start, end } = snippetRange(line);
    setSnippet((prev) => ({ nonce: (prev?.nonce ?? 0) + 1, label: displayTermForm(item, analysis.lines), start, end }));
  };
  const save = (item: PreviewItem, line: AnalyzedLine | null) => {
    const entry: SavedItem = {
      key: itemKey(item), videoId: analysis.videoId, type: item.type, term: item.term,
      lineIndex: line?.index ?? item.occurrences[0]?.lineIndex ?? 0, start: line?.start ?? item.occurrences[0]?.start ?? 0, savedAt: Date.now(),
    };
    toggleSaved(entry);
  };
  const markAsKnown = (item: PreviewItem) => {
    markKnown(itemKey(item));
    setLastKnown({ key: itemKey(item), label: displayTermForm(item, analysis.lines) });
  };
  const undo = () => {
    if (lastKnown) unmarkKnown(lastKnown.key);
    setLastKnown(null);
  };

  return (
    <>
      <PreviewHeader analysis={analysis} song={song} listenHref={listenHref} />

      <div className="mx-auto max-w-7xl px-gutter py-space-lg md:px-6 lg:px-12">
        <LevelFilterBar
          chips={view.chips} active={activeFilter} onChange={setLevelFilter} userLevel={state.level}
          hiddenBelowLevel={view.hiddenBelowLevel} showEasy={showEasy} onToggleEasy={() => setShowEasy((v) => !v)}
          knownCount={view.knownCount} onUndoKnown={lastKnown ? undo : null}
        />

        <div className="mt-space-lg grid grid-cols-1 items-start gap-8 pb-24 lg:grid-cols-12 md:pb-0">
          <section aria-labelledby="vocab-heading" className="flex flex-col gap-6 lg:col-span-8">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-5 w-2 rounded-full bg-primary" />
              <h2 id="vocab-heading" className="font-serif text-headline-lg-mobile md:text-headline-lg">Từ vựng cốt lõi</h2>
              <span className="text-label-md text-on-surface-variant">({view.vocab.length} từ)</span>
            </div>
            {view.vocab.length === 0 ? (
              <p className="rounded-xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">
                Không còn từ nào ở bộ lọc này. Bạn có thể đổi level hoặc chọn “Tất cả”.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {vocabShown.map((item) => (
                  <li key={item.id}>
                    <VocabCard item={item} lines={analysis.lines} videoId={analysis.videoId} promptVersion={analysis.promptVersion}
                      saved={savedKeys.has(itemKey(item))} onPlay={play} onToggleSave={save} onKnown={markAsKnown} />
                  </li>
                ))}
              </ul>
            )}
            {!showAllVocab && view.vocab.length > DEFAULT_VOCAB_SHOWN && (
              <button type="button" onClick={() => setShowAllVocab(true)}
                className="min-h-11 self-center rounded-full bg-surface-container px-6 text-label-md font-medium text-on-surface hover:bg-surface-container-high">
                Xem thêm ({view.vocab.length - DEFAULT_VOCAB_SHOWN})
              </button>
            )}
          </section>

          <section aria-labelledby="grammar-heading" className="flex flex-col gap-4 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-5 w-2 rounded-full bg-secondary" />
                <h2 id="grammar-heading" className="font-serif text-headline-lg-mobile md:text-headline-lg">Ngữ pháp trọng tâm</h2>
              </div>
              <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-label-sm font-semibold text-on-secondary-container">{view.grammar.length} mẫu</span>
            </div>
            {view.grammar.length === 0 ? (
              <p className="rounded-xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">Chưa có mẫu ngữ pháp nào ở bộ lọc này.</p>
            ) : (
              view.grammar.map((item, i) => (
                <GrammarCard key={item.id} item={item} index={i} lines={analysis.lines} videoId={analysis.videoId} promptVersion={analysis.promptVersion}
                  saved={savedKeys.has(itemKey(item))} onPlay={play} onToggleSave={save} onKnown={markAsKnown} />
              ))
            )}
          </section>
        </div>
      </div>

      {lastKnown && (
        <div role="status" className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-inverse-surface px-4 py-2 text-label-md text-inverse-on-surface shadow-lg md:bottom-6">
          Đã ẩn “{lastKnown.label}”
          <button type="button" onClick={undo} className="min-h-11 font-semibold text-inverse-primary underline underline-offset-4">Hoàn tác</button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 bg-surface/95 p-3 pb-safe backdrop-blur-md md:hidden">
        <Link href={listenHref} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary text-label-md font-semibold text-on-primary">
          <Icon name="play_arrow" filled size={20} />
          Bắt đầu nghe ({analysis.lines.length} câu)
        </Link>
      </div>

      {snippet && <SnippetPlayer videoId={analysis.videoId} request={snippet} />}
    </>
  );
}
