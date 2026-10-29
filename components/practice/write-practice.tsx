"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ModeTabs } from "@/components/review/mode-tabs";
import { StrokeWriter } from "@/components/tra-tu/stroke-writer";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { playChinese } from "@/lib/speech/play-chinese";
import { emptyWriteStats, outcomeFromStars, parseWriteStats, pickWriteTargets, pointsFromStars, recordWrite, type WriteTarget } from "@/lib/practice/write-hanzi";
import type { WritingScore } from "@/lib/tra-tu/score-writing";
import { useWordGameScore } from "./use-word-game-score";
import { recordWeekly } from "@/lib/pet/weekly-store";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

const STATS_KEY = "lyric-lab-write-stats";
const STATS_EVENT = "lyric-lab-write-stats-change";
const MIN_WORDS = 1;

/**
 * Chế độ "Viết chữ Hán": hiện nghĩa + pinyin (từ thẻ đã lưu) và người học viết từng chữ theo đúng thứ tự nét; có thể bấm "Xem nét" để xem lại. Không đổi lịch ôn
 * (viết tay là luyện thêm, chưa có cột lịch riêng); chỉ ghi thống kê sao tốt nhất ở thiết bị này để lượt sau ưu tiên từ chưa viết hoặc viết còn yếu.
 */
export function WritePractice() {
  const { status, cards, grade } = usePracticePool();
  const [stats, setStats] = useLocalJson(STATS_KEY, STATS_EVENT, parseWriteStats, emptyWriteStats);
  const [round, setRound] = useState(0);
  const targets = useMemo(() => (status === "ready" ? pickWriteTargets(cards, stats) : []),
    // Chỉ chọn lại khi nạp xong thẻ hoặc bấm "Lượt mới"; ghi thống kê giữa lượt không được xáo lại từ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, cards, round]);
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Viết chữ Hán" status={status}
        intro="Xem nghĩa, viết từng chữ theo đúng thứ tự nét bằng chuột hoặc ngón tay. Từ đã học và đến hạn sẽ được chấm vào lịch ôn (tối đa mức “Được”)."
        blocked={targets.length < MIN_WORDS ? "Chưa có từ vựng nào để tập viết (từ 1–3 chữ Hán). Lưu thêm từ khi xem trước một bài hát nhé." : null}
      >
        <WriteSession key={round} targets={targets} onWord={(t, stars) => {
          setStats(recordWrite(stats, t.key, stars, Date.now()));
          recordWeekly("write");
          // Viết xong một từ đã học và đến hạn thì chấm lịch ôn (đúng quy tắc game: tối đa mức "Được").
          const card = cards.find((c) => c.item_key === t.key);
          if (card) grade(card, outcomeFromStars(stars));
        }} onAgain={() => setRound((r) => r + 1)} />
      </PracticeFrame>
    </>
  );
}

function WriteSession({ targets, onWord, onAgain }: { targets: WriteTarget[]; onWord: (t: WriteTarget, stars: 1 | 2 | 3) => void; onAgain: () => void }) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [charStars, setCharStars] = useState<number[]>([]);
  const [done, setDone] = useState<{ term: string; stars: number }[]>([]);
  const [last, setLast] = useState<WritingScore | null>(null);
  const t = targets[wi];
  const doneStars = done.map((d) => d.stars as 1 | 2 | 3);
  // Điểm XP khi xong lượt: "đúng" = từ đạt ≥ 2 sao; điểm theo sao từng từ.
  const { saved } = useWordGameScore({ mode: "write", done: !t && done.length > 0, correct: doneStars.filter((n) => n >= 2).length, total: targets.length, points: doneStars.reduce((a, n) => a + pointsFromStars(n), 0) });
  if (!t) {
    const total = done.reduce((a, d) => a + d.stars, 0);
    return (
      <section aria-label="Kết quả" className="card-ink space-y-space-sm p-space-md text-center">
        <h2 className="text-headline-md">Xong {done.length} từ!</h2>
        <p className="text-body-md">{total}/{done.length * 3} sao{saved ? " · đã ghi điểm XP" : ""}</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {done.map((d) => <li key={d.term} lang="zh-Hans" className="rounded-full border-2 border-ink bg-surface-container-lowest px-3 py-1 font-serif text-lg font-bold">{d.term} <span className="text-label-md text-primary">{"★".repeat(d.stars)}{"☆".repeat(3 - d.stars)}</span></li>)}
        </ul>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onAgain} className="btn-3d btn-3d-primary min-h-11 px-5 text-label-md font-extrabold">Lượt mới</button>
          <Link href="/review" className="inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-bold underline">Về Ôn & Nói</Link>
        </div>
      </section>
    );
  }
  const lastChar = ci === t.chars.length - 1;
  const next = () => {
    const stars = [...charStars, last?.stars ?? 1];
    if (!lastChar) { setCharStars(stars); setCi(ci + 1); setLast(null); return; }
    // Điểm của từ = sao thấp nhất trong các chữ (một chữ yếu thì cả từ chưa chắc).
    const w = Math.min(...stars) as 1 | 2 | 3;
    onWord(t, w);
    setDone((d) => [...d, { term: t.term, stars: w }]);
    setWi(wi + 1); setCi(0); setCharStars([]); setLast(null);
  };
  return (
    <section aria-label={`Từ ${wi + 1}/${targets.length}`} className="card-ink space-y-space-sm p-space-md">
      <p className="text-label-md font-bold text-on-surface-variant">Từ {wi + 1}/{targets.length} · chữ {ci + 1}/{t.chars.length}</p>
      <div className="flex flex-wrap items-center gap-x-3">
        {t.pinyin && <span className="text-pinyin-reading text-primary">{t.pinyin}</span>}
        <span className="text-headline-sm font-extrabold">{t.meaning}</span>
        <button type="button" onClick={() => void playChinese(t.term)} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">Nghe</button>
      </div>
      <p aria-label="Tiến độ các chữ" className="text-label-md text-on-surface-variant">{t.chars.map((c, i) => (i < ci ? c : "◻")).join(" ")}</p>
      <StrokeWriter key={`${wi}-${ci}`} char={t.chars[ci]} startMode="practice" blind onScore={setLast} />
      <div className="flex justify-center">
        <button type="button" disabled={!last} onClick={next} className="btn-3d btn-3d-primary min-h-11 px-6 text-label-md font-extrabold disabled:opacity-50">{lastChar ? (wi === targets.length - 1 ? "Xong" : "Từ tiếp") : "Chữ tiếp"}</button>
      </div>
    </section>
  );
}
