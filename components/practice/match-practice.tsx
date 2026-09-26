"use client";

import { submitRoundScore } from "@/lib/practice/submit-score";
import { ModeTabs } from "@/components/review/mode-tabs";
import { shortMeaning } from "@/lib/practice/match-round";
import { MatchGame } from "./match-game";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

const MIN_CARDS = 4;

/** Trang chế độ Ghép cặp: cần ít nhất 4 thẻ có nghĩa khác nhau. */
export function MatchPractice() {
  const { status, cards } = usePracticePool();
  const eligible = cards.filter((c) => c.kind === "vocab" && shortMeaning(c.meaning));
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Ghép cặp" status={status}
        intro="Nối chữ Hán với nghĩa của nó càng nhanh càng tốt. Chế độ này chỉ để luyện thêm, không đổi lịch ôn."
        blocked={eligible.length < MIN_CARDS ? `Cần ít nhất ${MIN_CARDS} từ vựng đã lưu để ghép cặp (bạn có ${eligible.length}). Lưu thêm từ khi xem trước một bài hát nhé.` : null}
      >
        <MatchGame cards={eligible} onRoundEnd={(r) => void submitRoundScore("match", r)} />
      </PracticeFrame>
    </>
  );
}
