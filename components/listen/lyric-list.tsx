"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { LyricLineRow, type LineState, type WordSelection } from "./lyric-line-row";
import { useIsAdmin } from "@/components/library/use-is-admin";
import { LineEditDialog } from "./line-edit-dialog";
import { LineShareDialog } from "@/components/share/line-share-dialog";
import { SITE_URL } from "@/lib/seo/site-url";
import { ViewToggles } from "./view-toggles";

// Sau khi người dùng tự cuộn, tạm ngừng tự cuộn theo lời để không giật màn hình.
const MANUAL_SCROLL_PAUSE_MS = 4000;

interface LyricListProps {
  videoId: string;
  promptVersion: string;
  lines: AnalyzedLine[];
  currentIndex: number;
  vocab: PreviewItem[];
  grammar: PreviewItem[];
  showPinyin: boolean;
  showTranslation: boolean;
  /** Tự cuộn theo câu đang hát. Tắt (ghim) khi người dùng muốn đọc chỗ khác mà không bị kéo về. */
  autoScroll: boolean;
  /** Có thì mỗi dòng có nút chia sẻ thành ảnh, kèm tên bài/nghệ sĩ in trên thẻ. */
  shareContext?: { title: string; artist?: string };
  onTogglePinyin: () => void;
  onToggleTranslation: () => void;
  onSeek: (index: number) => void;
  onWord: (word: WordSelection) => void;
  onPauseSong: () => void;
  /** Mặc định bật; video luyện nghe tắt gợi ý sửa bản dịch và đổi tiêu đề/mô tả cho hợp lời nói. */
  variant?: "lyrics" | "speech";
}

/** Danh sách lời chạy theo nhạc: câu đang hát nằm giữa màn hình (LS-02), các câu qua rồi mờ đi. */
export function LyricList({ videoId, promptVersion, lines, currentIndex, vocab, grammar, showPinyin, showTranslation, autoScroll, shareContext, onTogglePinyin, onToggleTranslation, onSeek, onWord, onPauseSong, variant = "lyrics" }: LyricListProps) {
  const [sharing, setSharing] = useState<number | null>(null);
  const shareLine = useCallback((index: number) => setSharing(index), []);
  // Quản trị viên sửa lời ngay trên danh sách (chỉ bài hát, không phải video luyện nghe; video có trang quản trị riêng).
  const isAdmin = useIsAdmin();
  const [editing, setEditing] = useState<number | null>(null);
  const editLine = useCallback((index: number) => setEditing(index), []);
  const editedLine = editing !== null ? lines.find((l) => l.index === editing) : undefined;
  const sharedLine = sharing !== null ? lines.find((l) => l.index === sharing) : undefined;
  // Phụ thuộc vào chuỗi (không phải đối tượng `shareContext` mới mỗi lần vẽ) để thẻ không dựng lại ảnh mỗi 100 ms khi nhạc chạy.
  const shareTitle = shareContext?.title;
  const shareArtist = shareContext?.artist;
  const shareCard = useMemo(
    () => (sharedLine && shareTitle ? { han: sharedLine.text, pinyin: sharedLine.pinyin, translation: sharedLine.translation, title: shareTitle, artist: shareArtist } : null),
    [sharedLine, shareTitle, shareArtist],
  );
  const listRef = useRef<HTMLOListElement>(null);
  const lastManualScroll = useRef(0);

  const vocabIds = useMemo(() => new Set(vocab.map((v) => v.id)), [vocab]);
  // Ngữ pháp của từng dòng (id + vị trí ký tự), tính một lần thay vì mỗi lần vẽ.
  const grammarByLine = useMemo(() => {
    const byLine = new Map<number, { id: string; ranges: [number, number][] }[]>();
    for (const g of grammar) {
      for (const o of g.occurrences) {
        if (o.ranges?.length) byLine.set(o.lineIndex, [...(byLine.get(o.lineIndex) ?? []), { id: g.id, ranges: o.ranges }]);
      }
    }
    return byLine;
  }, [grammar]);

  // Đối tượng tô sáng ổn định theo dòng để LyricLineRow (memo) không vẽ lại mỗi 100 ms.
  const highlightsByLine = useMemo(
    () => new Map(lines.map((l) => [l.index, { vocabIds, grammar: grammarByLine.get(l.index) ?? [] }])),
    [lines, vocabIds, grammarByLine],
  );

  useEffect(() => {
    const mark = () => { lastManualScroll.current = Date.now(); };
    const el = listRef.current;
    // Gắn vào khu vực danh sách lời (không phải window): cuộn/chạm ở nơi khác trên trang (vd. khung từ vựng
    // bên cạnh) không được tính là "người dùng tự cuộn lời" — trước đây gắn vào window nên việc đó vô tình
    // tắt tự cuộn 4 giây, gây cảm giác tự cuộn "lúc có lúc không".
    el?.addEventListener("wheel", mark, { passive: true });
    el?.addEventListener("touchmove", mark, { passive: true });
    el?.addEventListener("pointerdown", mark, { passive: true });
    return () => {
      el?.removeEventListener("wheel", mark);
      el?.removeEventListener("touchmove", mark);
      el?.removeEventListener("pointerdown", mark);
    };
  }, []);

  // Đưa câu đang hát về giữa phần màn hình còn trống bên dưới khối video + thanh điều khiển dính ở trên.
  const centerLine = useCallback((index: number, smooth: boolean) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-line-index="${index}"]`);
    if (!el) return;
    const stickyBottom = document.querySelector("[data-sticky-player]")?.getBoundingClientRect().bottom ?? 64;
    const target = stickyBottom + (window.innerHeight - stickyBottom) / 2;
    const rect = el.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: rect.top + rect.height / 2 - target, behavior: smooth && !reduce ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (!autoScroll || currentIndex < 0 || Date.now() - lastManualScroll.current < MANUAL_SCROLL_PAUSE_MS) return;
    centerLine(currentIndex, true);
  }, [currentIndex, autoScroll, centerLine]);

  // Bật/tắt bản dịch hoặc pinyin làm các dòng cao thấp khác đi nên câu đang hát bị đẩy khỏi chỗ cũ: giữ nó ở giữa ngay sau khi bố cục đổi
  // (không chờ tự cuộn, không tính là người dùng tự cuộn). Bỏ qua lần vẽ đầu.
  const layoutKey = `${showPinyin}|${showTranslation}`;
  const prevLayoutKey = useRef(layoutKey);
  useLayoutEffect(() => {
    if (prevLayoutKey.current === layoutKey) return;
    prevLayoutKey.current = layoutKey;
    if (currentIndex >= 0) centerLine(currentIndex, false);
  }, [layoutKey, currentIndex, centerLine]);

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-2.5 shadow-sm md:gap-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-serif text-headline-md text-on-surface max-md:sr-only">
          <Icon name="format_quote" size={20} className="text-primary" />
          {variant === "speech" ? "Bản chép" : "Lời ca & nhịp điệu"}
        </h2>
        <p className="text-label-sm text-on-surface-variant max-md:hidden">Bấm câu để nhảy tới đó · bấm từ để tra</p>
        <ViewToggles
          className="flex md:hidden"
          showPinyin={showPinyin} showTranslation={showTranslation}
          onTogglePinyin={onTogglePinyin} onToggleTranslation={onToggleTranslation}
        />
      </div>
      <ol ref={listRef} className="flex flex-col gap-0.5 md:gap-2">
        {lines.map((line) => {
          const state: LineState = line.index === currentIndex ? "active" : line.index < currentIndex ? "past" : "upcoming";
          return (
            <LyricLineRow
              key={line.index}
              videoId={videoId}
              promptVersion={promptVersion}
              line={line}
              state={state}
              showPinyin={showPinyin}
              showTranslation={showTranslation}
              highlights={highlightsByLine.get(line.index)!}
              onSeek={onSeek}
              onWord={onWord}
              onPauseSong={onPauseSong}
              allowTranslationSuggestion={variant === "lyrics"}
              onShare={shareContext ? shareLine : undefined}
              onEdit={variant === "lyrics" && isAdmin === true ? editLine : undefined}
            />
          );
        })}
      </ol>
      {shareCard && <LineShareDialog card={shareCard} shareUrl={`${SITE_URL}/learn/${videoId}?line=${sharing}`} onClose={() => setSharing(null)} />}
      {editedLine && <LineEditDialog videoId={videoId} line={editedLine} onClose={() => setEditing(null)} />}
    </div>
  );
}
