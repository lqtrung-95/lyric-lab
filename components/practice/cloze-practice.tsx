"use client";

import { ModeTabs } from "@/components/review/mode-tabs";
import { ClozeGame } from "./cloze-game";
import { useClozeCandidates } from "./cloze-questions";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

/** Trang chế độ Điền lời: cần thẻ có câu hát nguồn còn trong hệ thống. */
export function ClozePractice() {
  const { status, cards, grade } = usePracticePool();
  const candidates = useClozeCandidates(status === "ready" ? cards : []);
  const loading = status === "loading" || (status === "ready" && cards.length > 0 && candidates === undefined);
  const blocked = candidates && candidates.length === 0
    ? "Chưa có thẻ nào có câu hát để điền. Thẻ cần được lưu từ một bài hát còn trong hệ thống, và từ phải nằm nguyên trong câu."
    : null;
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Điền lời" status={loading ? "loading" : status}
        intro="Điền từ còn thiếu vào câu hát. Đúng thẻ đến hạn thì lịch ôn của thẻ được cập nhật (tối đa mức “Được”)."
        blocked={status === "ready" && cards.length === 0 ? "Bạn chưa có thẻ nào. Lưu vài từ khi xem trước một bài hát để bắt đầu luyện." : blocked}
      >
        {candidates && <ClozeGame candidates={candidates} poolTerms={cards.filter((c) => c.kind === "vocab").map((c) => c.term)} grade={grade} />}
      </PracticeFrame>
    </>
  );
}
