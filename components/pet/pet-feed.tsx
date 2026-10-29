"use client";

import { useMemo, useState } from "react";
import type { Grade } from "ts-fsrs";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import { RatingButtons } from "@/components/review/rating-buttons";
import { useReviewSession } from "@/components/review/use-review-session";
import { playSfx } from "@/lib/feedback/sfx";
import { feedDone, feedLimit } from "@/lib/pet/pet-feed";
import { playChinese } from "@/lib/speech/play-chinese";
import { previewIntervals } from "@/lib/srs/fsrs-scheduler";

/**
 * Cho pet ăn: ôn nhanh 1–3 thẻ đến hạn ngay trong thẻ pet. Dùng đúng `useReviewSession` của màn Ôn nên lịch FSRS, nhật ký ôn và XP tính
 * như ôn thường (pet không ghi XP riêng). Chỉ được mount khi người dùng bấm "Cho ăn" để trang chủ không tải thêm hàng đợi.
 * `onEat` gọi mỗi lần chấm một thẻ (pet nhai); `onClose` đóng khung.
 */
export function PetFeed({ name, onEat, onClose }: { name: string; onEat: () => void; onClose: () => void }) {
  const s = useReviewSession();
  const [flipped, setFlipped] = useState(false);
  const [ate, setAte] = useState(0);
  // Chốt số thẻ của lần này khi hàng đợi vừa tải xong (đổi theo hàng đợi đang co lại thì giới hạn sẽ tụt theo).
  const limit = useMemo(() => feedLimit(s.initialTotal), [s.initialTotal]);
  const card = s.current;
  const intervals = useMemo(() => (card && flipped ? previewIntervals(card, new Date()) : null), [card, flipped]);
  const finished = feedDone(ate, limit);

  const grade = (rating: Grade) => {
    playSfx(rating === 1 ? "wrong" : "correct");
    setFlipped(false);
    s.grade(rating);
    onEat();
    const nextAte = ate + 1;
    setAte(nextAte);
    if (feedDone(nextAte, limit)) refreshGameSummary();
  };

  let body;
  if (s.status === "loading") body = <p role="status" className="text-body-md text-on-surface-variant">Đang lấy thẻ cho {name}…</p>;
  else if (s.status === "error") body = <p role="alert" className="text-body-md text-error">Chưa tải được thẻ ôn. Kiểm tra kết nối rồi thử lại nhé.</p>;
  else if (finished || s.status === "finished") body = <p role="status" className="text-body-md font-bold text-secondary">Ngon quá! {name} no rồi, cảm ơn bạn. Mỗi thẻ vừa ôn đã được xếp lịch ôn tiếp theo.</p>;
  else if (s.status === "empty" || !card) body = <p role="status" className="text-body-md text-on-surface-variant">Hôm nay không còn thẻ nào đến hạn cho {name} ăn.</p>;
  else body = (
    <div>
      <p className="text-label-md text-on-surface-variant">Thẻ {Math.min(ate + 1, limit)}/{limit}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3">
        <span lang="zh" className="font-serif text-hanzi-display">{card.term}</span>
        {card.pinyin && <span className="text-pinyin-reading text-primary">{card.pinyin}</span>}
        <button type="button" onClick={() => void playChinese(card.term)} className="min-h-11 rounded-full px-3 text-label-md font-bold text-secondary hover:bg-surface-container">Nghe</button>
      </div>
      {flipped && intervals ? (
        <div className="mt-2">
          <p className="mb-2 text-body-md font-medium">{card.meaning}</p>
          <RatingButtons intervals={intervals} onGrade={grade} />
        </div>
      ) : (
        <button type="button" onClick={() => setFlipped(true)} className="mt-2 min-h-11 rounded-full border-2 border-ink bg-primary-container px-5 text-label-md font-bold">Xem nghĩa</button>
      )}
      {s.saveError && <p role="alert" className="mt-2 text-label-md text-error">Chưa lưu được kết quả lần chấm vừa rồi. Kiểm tra kết nối nhé.</p>}
    </div>
  );

  return (
    <div className="basis-full rounded-2xl bg-surface-container-low p-space-sm" aria-label={`Cho ${name} ăn`} role="group">
      {body}
      <button type="button" onClick={onClose} className="mt-2 min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">{finished || s.status === "finished" ? "Xong" : "Để lúc khác"}</button>
    </div>
  );
}
