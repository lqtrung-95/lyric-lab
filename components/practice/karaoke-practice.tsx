"use client";

import { useMemo, useState } from "react";
import { submitRoundScore } from "@/lib/practice/submit-score";
import { ModeTabs } from "@/components/review/mode-tabs";
import { karaokeSongs, planKaraoke, type KaraokeCandidate } from "@/lib/practice/karaoke-plan";
import type { ReviewCard } from "@/lib/user-data/review-repo";
import { readLyricOffset } from "@/lib/user-state/use-lyric-offset";
import { useClozeCandidates } from "./cloze-questions";
import { KaraokeGame } from "./karaoke-game";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

/** Trang chế độ Karaoke: chọn một bài có ít nhất 2 câu chứa từ đã lưu, rồi vào game. */
export function KaraokePractice() {
  const { status, cards, grade } = usePracticePool();
  const candidates = useClozeCandidates(status === "ready" ? cards : []);
  const [songId, setSongId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const karaoke = useMemo<KaraokeCandidate<ReviewCard>[]>(
    () => (candidates ?? []).map((c) => ({ card: c.card, line: c.line, videoId: c.videoId, lineIndex: c.lineIndex })),
    [candidates],
  );
  const songs = useMemo(() => karaokeSongs(karaoke, Object.fromEntries((candidates ?? []).map((c) => [c.videoId, c.title]))), [karaoke, candidates]);
  const song = songs.find((s) => s.videoId === songId);
  const steps = useMemo(() => (song ? planKaraoke(karaoke, song.videoId, readLyricOffset(song.videoId)) : []), [song, karaoke]);
  const poolTerms = useMemo(() => cards.filter((c) => c.kind === "vocab").map((c) => c.term), [cards]);

  const loading = status === "loading" || (status === "ready" && cards.length > 0 && candidates === undefined);
  const blocked = candidates && songs.length === 0
    ? "Chưa có bài nào đủ điều kiện. Karaoke cần một bài có ít nhất 2 câu hát chứa từ bạn đã lưu (và bài còn trong hệ thống)."
    : status === "ready" && cards.length === 0 ? "Bạn chưa có thẻ nào. Lưu vài từ khi xem trước một bài hát để bắt đầu luyện." : null;

  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Karaoke điền lời" status={loading ? "loading" : status} blocked={blocked}
        intro="Nghe bài hát và điền từ còn thiếu vào đúng câu hát. Chỉ hiện các câu có từ bạn đã lưu. Đúng thẻ đến hạn thì lịch ôn được cập nhật (tối đa mức “Được”)."
      >
        {song ? (
          <KaraokeGame key={`${song.videoId}-${live}`} videoId={song.videoId} title={song.title} steps={steps} poolTerms={poolTerms} live={live} showHints={showHints} grade={grade} onExit={() => setSongId(null)} onRoundEnd={(r) => void submitRoundScore("karaoke", r)} />
        ) : (
          <div>
            <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface-variant">
              <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} className="h-5 w-5 accent-primary" />
              Chạy liên tục (không tạm dừng chờ, phải trả lời trước khi câu hát qua)
            </label>
            <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface-variant">
              <input type="checkbox" checked={showHints} onChange={(e) => setShowHints(e.target.checked)} className="h-5 w-5 accent-primary" />
              Hiện pinyin và nghĩa cả câu (đỡ khó hơn)
            </label>
            <ul aria-label="Chọn bài hát" className="mt-space-sm space-y-space-sm">
              {songs.map((s) => (
                <li key={s.videoId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
                  <div className="min-w-0"><p className="line-clamp-2 text-body-md font-medium text-on-surface">{s.title}</p><p className="text-label-md text-on-surface-variant">{s.questions} câu để điền</p></div>
                  <button type="button" onClick={() => setSongId(s.videoId)} aria-label={`Chơi bài ${s.title}`} className="min-h-11 shrink-0 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">Chơi bài này</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PracticeFrame>
    </>
  );
}
