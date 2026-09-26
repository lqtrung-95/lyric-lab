"use client";

import { ModeTabs } from "@/components/review/mode-tabs";
import { shortMeaning } from "@/lib/practice/match-round";
import { ListenGame } from "./listen-game";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

const MIN_CARDS = 4;

/** Trang chế độ Nghe và chọn: cần ít nhất 4 từ vựng để có đủ đáp án. */
export function ListenPractice() {
  const { status, cards, grade } = usePracticePool();
  const eligible = cards.filter((c) => c.kind === "vocab" && shortMeaning(c.meaning));
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Nghe và chọn" status={status}
        intro="Nghe giọng đọc rồi chọn chữ Hán hoặc nghĩa đúng. Đúng thẻ đến hạn thì lịch ôn của thẻ được cập nhật (tối đa mức “Được”)."
        blocked={eligible.length < MIN_CARDS ? `Cần ít nhất ${MIN_CARDS} từ vựng đã lưu (bạn có ${eligible.length}). Lưu thêm từ khi xem trước một bài hát nhé.` : null}
      >
        <ListenGame cards={eligible} grade={grade} />
      </PracticeFrame>
    </>
  );
}
