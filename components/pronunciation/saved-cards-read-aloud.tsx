"use client";

import { useMemo } from "react";
import { PracticeFrame } from "@/components/practice/practice-frame";
import { usePracticePool } from "@/components/practice/use-practice-pool";
import { ModeTabs } from "@/components/review/mode-tabs";
import { pickSentencesFromCards } from "@/lib/pronunciation/card-sentences";
import { ReadAloudPractice } from "./read-aloud-practice";

/** Đọc to các từ vựng bạn đã lưu và nhận điểm từng chữ. Mỗi lần mở trang chọn ngẫu nhiên 8 từ. */
export function SavedCardsReadAloud() {
  const { status, cards } = usePracticePool();
  const sentences = useMemo(() => pickSentencesFromCards(cards), [cards]);
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Đọc to từ đã lưu" status={status}
        intro="Chọn một từ trong thẻ của bạn, nghe mẫu rồi đọc lại để nhận điểm từng chữ. Không ảnh hưởng lịch ôn."
        blocked={sentences.length === 0 ? "Chưa có từ vựng nào để đọc. Lưu thêm từ khi xem trước một bài hát nhé." : null}
      >
        <ReadAloudPractice sentences={sentences} allowCustom={false} />
      </PracticeFrame>
    </>
  );
}
