"use client";

import { submitRoundScore } from "@/lib/practice/submit-score";
import { ModeTabs } from "@/components/review/mode-tabs";
import { PinyinGame } from "./pinyin-game";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

/** Trang chế độ Gõ pinyin: nạp thẻ từ vựng có pinyin của người dùng rồi vào game. */
export function PinyinPractice() {
  const { status, cards, grade } = usePracticePool();
  const eligible = cards.filter((c) => c.kind === "vocab" && c.pinyin);
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Gõ pinyin" status={status}
        intro="Nhìn chữ Hán, gõ pinyin. Đúng thẻ đến hạn thì lịch ôn của thẻ được cập nhật (tối đa mức “Được”)."
        blocked={eligible.length === 0 ? "Bạn chưa có thẻ từ vựng nào. Lưu vài từ khi xem trước một bài hát để bắt đầu luyện." : null}
      >
        <PinyinGame cards={eligible} grade={grade} onRoundEnd={(r) => void submitRoundScore("pinyin", r)} />
      </PracticeFrame>
    </>
  );
}
