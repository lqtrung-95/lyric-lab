"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Grade } from "ts-fsrs";
import { Icon } from "@/components/ui/icon";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { shiftLines } from "@/lib/listen/lyric-offset";
import { useLyricOffset } from "@/lib/user-state/use-lyric-offset";
import { snippetRange } from "@/lib/preview/preview-format";
import { previewIntervals } from "@/lib/srs/fsrs-scheduler";
import { FlashCard } from "./flash-card";
import { RatingButtons } from "./rating-buttons";
import { ReviewMessage } from "./review-message";
import { useReviewSession } from "./use-review-session";

/** Màn Ôn tập (S7): một thẻ một lần, lật rồi chấm 1–4 (Quên/Khó/Được/Dễ). */
export function ReviewScreen() {
  const s = useReviewSession();
  const [flipped, setFlipped] = useState(false);
  const [snippet, setSnippet] = useState<SnippetRequest | null>(null);
  const card = s.current;
  const line = card?.line_index != null ? s.context?.lines[card.line_index] ?? null : null;
  const { offset } = useLyricOffset(card?.video_id);
  const intervals = useMemo(() => (card && flipped ? previewIntervals(card, new Date()) : null), [card, flipped]);

  const grade = (rating: Grade) => {
    setFlipped(false);
    setSnippet(null);
    s.grade(rating);
  };
  const replay = () => {
    if (!line || !card) return;
    setSnippet((prev) => ({ nonce: (prev?.nonce ?? 0) + 1, label: card.term, ...snippetRange(shiftLines([line], offset)[0]) }));
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || !card) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        grade(Number(e.key) as Grade);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (s.status === "loading") return <p role="status" className="py-space-xl text-center text-body-md text-on-surface-variant">Đang tải thẻ ôn…</p>;
  if (s.status === "error") {
    return <ReviewMessage icon="warning" title="Chưa tải được thẻ ôn" body="Kiểm tra kết nối rồi tải lại trang nhé." />;
  }
  if (s.status === "empty") {
    return s.cardCount === 0
      ? <ReviewMessage icon="style" title="Chưa có thẻ nào để ôn" body="Khi xem trước một bài, bấm “Lưu” ở từ vựng hoặc ngữ pháp bạn muốn nhớ, thẻ sẽ xuất hiện ở đây." action={{ href: "/", label: "Chọn bài hát" }} />
      : <ReviewMessage icon="check_circle" title="Hôm nay bạn đã ôn xong" body="Không còn thẻ nào đến hạn. Thẻ mới sẽ tới theo hạn mức mỗi ngày, quay lại vào ngày mai nhé." action={{ href: "/", label: "Học bài mới" }} />;
  }
  if (s.status === "finished" || !card) {
    return (
      <div>
        <ReviewMessage icon="check_circle" title="Xong buổi ôn hôm nay" body={`Bạn đã ôn ${s.initialTotal} thẻ. Lịch ôn kế tiếp đã được FSRS xếp cho từng thẻ.`} action={{ href: "/", label: "Học bài mới" }} />
        {s.canUndo && <UndoButton onClick={() => { setFlipped(false); void s.undo(); }} />}
      </div>
    );
  }

  const done = Math.max(0, s.initialTotal - s.remaining);
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-space-md">
      <h1 className="sr-only">Ôn tập</h1>
      <div className="w-full">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-low px-4 text-label-md text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={18} />
            Thoát
          </Link>
          <p className="rounded-full bg-surface-container-high px-3 py-1 text-label-md font-medium text-on-surface">
            Còn <strong className="text-primary">{s.remaining}</strong> thẻ
          </p>
        </div>
        <div role="progressbar" aria-label="Tiến độ buổi ôn" aria-valuemin={0} aria-valuemax={s.initialTotal} aria-valuenow={done}
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${s.initialTotal ? (done / s.initialTotal) * 100 : 0}%` }} />
        </div>
      </div>

      <FlashCard card={card} flipped={flipped} line={line} context={s.context} onFlip={() => setFlipped((f) => !f)} onReplay={replay} />

      {flipped && intervals ? (
        <div className="w-full max-w-[720px]"><RatingButtons intervals={intervals} onGrade={grade} /></div>
      ) : (
        <p className="text-label-md text-on-surface-variant">Bấm Space để lật thẻ, rồi dùng phím 1–4 để chấm.</p>
      )}
      {s.saveError && <p role="alert" className="text-label-md text-error">Chưa lưu được kết quả lần chấm vừa rồi. Kiểm tra kết nối nhé.</p>}
      {s.canUndo && <UndoButton onClick={() => { setFlipped(false); void s.undo(); }} />}
      {snippet && card.video_id && <SnippetPlayer key={card.video_id} videoId={card.video_id} request={snippet} />}
    </div>
  );
}

function UndoButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mx-auto mt-space-sm inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">
      <Icon name="undo" size={18} />
      Hoàn tác lần chấm vừa rồi
    </button>
  );
}
