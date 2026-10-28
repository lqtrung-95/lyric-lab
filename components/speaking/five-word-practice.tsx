"use client";

import { useMemo, useState } from "react";
import { PracticeFrame } from "@/components/practice/practice-frame";
import { usePracticePool } from "@/components/practice/use-practice-pool";
import { ModeTabs } from "@/components/review/mode-tabs";
import { FIVE_WORD_COUNT, pickFiveWords } from "@/lib/speaking/pick-five-words";
import type { MicCheck } from "@/lib/speaking/vad-recorder";
import { FiveWordRound } from "./five-word-round";
import { MicIntro } from "./mic-intro";

/** Trang "Dùng 5 từ": lấy 5 từ vựng từ thẻ của người học (ưu tiên thẻ đến hạn), ép dùng trong lời nói; từ dùng được thì được tính là đã ôn đúng. */
export function FiveWordPractice() {
  const { status, cards, grade } = usePracticePool();
  const [mic, setMic] = useState<MicCheck | null>(null);
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const picked = useMemo(() => pickFiveWords(cards, new Date()), [cards, round]);
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Dùng 5 từ" status={status}
        intro="Nói một đến hai câu dùng đủ 5 từ bạn đã lưu trong 30 giây. Từ nào dùng được trong câu thật, bạn nhớ sâu hơn là chỉ nhận ra mặt chữ."
        blocked={picked.length < FIVE_WORD_COUNT ? `Cần ít nhất ${FIVE_WORD_COUNT} từ vựng 2–4 chữ đã lưu (bạn có ${picked.length}). Lưu thêm từ khi xem trước một bài hát nhé.` : null}
      >
        {mic === null
          ? <MicIntro title="Dùng 5 từ" onStart={setMic} steps={["Bạn thấy 5 từ vựng đã lưu.", "Bấm Bắt đầu, nói một đến hai câu có đủ 5 từ (30 giây).", "Từ nào dùng đúng sẽ được tính là đã ôn."]} />
          : <FiveWordRound key={round} cards={picked} typingOnly={mic !== "ok"} onUsed={(used) => used.forEach((c) => grade(c, "correct"))} onNext={() => setRound((r) => r + 1)} />}
      </PracticeFrame>
    </>
  );
}
