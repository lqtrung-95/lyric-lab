"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { arcadeRound } from "@/lib/games/arcade-score";
import { DAILY_TRIES, dailyPoints, parseGuess } from "@/lib/games/daily-guess";
import { dayNumber, pickDaily } from "@/lib/games/daily-word";
import { EMPTY_DAILY, guessesFor, parseDaily, readDailyRaw, subscribeDaily, withGuess, withResult, writeDaily } from "@/lib/games/daily-store";
import type { GameWord } from "@/lib/games/game-word";
import { isSolved, scoreGuess, shareRow, syllablesOf } from "@/lib/games/pinyin-parts";
import { DailyBoard, type BoardRow } from "./daily-board";
import { useArcadeScore } from "./use-arcade-score";

/** Hán tự mỗi ngày (kiểu Wordle): cả nước cùng đoán một từ hai chữ. Gõ pinyin kèm số thanh; mỗi âm tiết được chấm riêng phụ âm đầu, vần và thanh. Kết quả chia sẻ bằng ô màu, không lộ đáp án. */
export function DailyGame({ bank, todayKey }: { bank: GameWord[]; todayKey: string }) {
  const answer = useMemo(() => pickDaily(bank, todayKey), [bank, todayKey]);
  const answerSyls = useMemo(() => (answer ? syllablesOf(answer.pinyin) : null), [answer]);
  const raw = useSyncExternalStore(subscribeDaily, () => readDailyRaw(), () => "");
  const blob = useMemo(() => (raw ? parseDaily(raw) : EMPTY_DAILY), [raw]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justWon, setJustWon] = useState(false);

  const rows: BoardRow[] = useMemo(() => {
    if (!answerSyls) return [];
    return guessesFor(blob, todayKey).flatMap((g) => { const p = parseGuess(g); return p ? [{ syls: p.syls, marks: scoreGuess(answerSyls, p.syls) }] : []; });
  }, [blob, todayKey, answerSyls]);
  const won = rows.some((r) => isSolved(r.marks));
  const over = won || rows.length >= DAILY_TRIES;
  const { saved } = useArcadeScore("daily", justWon, (sec) => arcadeRound(dailyPoints(rows.length), 1, 1, sec));

  if (!answer || !answerSyls) return <p role="alert" className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-md text-on-surface-variant">Chưa tải được từ của hôm nay. Thử tải lại trang nhé.</p>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const g = parseGuess(text);
    if (!g) { setError("Gõ 2 âm tiết cách nhau bằng dấu cách, ví dụ: peng you hoặc peng2 you3 (thanh nhẹ là 5)."); return; }
    if (guessesFor(blob, todayKey).includes(g.norm)) { setError("Bạn đã đoán từ này rồi."); return; }
    const hit = isSolved(scoreGuess(answerSyls!, g.syls));
    const done = hit || rows.length + 1 >= DAILY_TRIES;
    let next = withGuess(blob, todayKey, g.norm);
    if (done) next = withResult(next, todayKey, hit);
    writeDaily(next);
    setText(""); setError(null);
    if (hit) setJustWon(true);
  }
  async function share() {
    const head = `SongHanzi Hán tự mỗi ngày #${dayNumber(todayKey)} ${won ? rows.length : "X"}/${DAILY_TRIES}`;
    const msg = `${head}\n${rows.map((r) => shareRow(r.marks)).join("\n")}\n${window.location.origin}/review/daily`;
    try {
      if (navigator.share) await navigator.share({ text: msg });
      else { await navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* người dùng đóng hộp chia sẻ */ }
  }

  const { streak, wins, played } = blob.stats;
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-lg font-extrabold">
        <span>Ngày #{dayNumber(todayKey)}</span>
        <span>🔥 Chuỗi {streak} · Thắng {wins}/{played}</span>
      </div>
      <DailyBoard rows={rows} tries={DAILY_TRIES} />
      {!over && rows.length >= 2 && (
        <p className="flex flex-wrap items-center gap-2 text-body-md text-secondary">
          Gợi ý: {rows.length >= 4 ? "từ này là" : "chữ đầu tiên là"} <span lang="zh-Hans" className="text-headline-md font-bold">{rows.length >= 4 ? answer.han : answer.han[0]}</span>
          <PronounceButton text={rows.length >= 4 ? answer.han : answer.han[0]} />
        </p>
      )}
      {!over && (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <label htmlFor="daily-guess" className="text-label-md font-bold">Từ hai chữ (HSK 2–4). Gõ 2 âm tiết cách nhau bằng dấu cách: <span className="font-mono">peng you</span> để dò âm trước, thêm số thanh <span className="font-mono">peng2 you3</span> khi đã chắc</label>
          <div className="flex gap-2">
            <input id="daily-guess" value={text} onChange={(e) => { setText(e.target.value); setError(null); }} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              className="min-h-12 min-w-0 flex-1 rounded-2xl bg-surface-container px-4 font-mono text-body-lg outline-none ring-2 ring-transparent focus:ring-secondary" />
            <button type="submit" disabled={!text.trim()} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">Đoán</button>
          </div>
          {error && <p role="alert" className="text-label-md font-bold text-error">{error}</p>}
          <p className="text-body-sm text-on-surface-variant">Ô xanh ✓: đúng vị trí. Ô vàng ~: có trong từ nhưng sai vị trí. Ô xám: không có. Ô ? : bạn chưa gõ thanh. Ba ô mỗi âm tiết là phụ âm đầu, vần, thanh. Muốn thắng phải gõ đủ thanh. Đoán sai 2 lượt sẽ có gợi ý chữ Hán.</p>
        </form>
      )}
      {over && (
        <section aria-labelledby="daily-done" className="rounded-2xl bg-surface-container-low p-space-md text-center">
          <h2 id="daily-done" className="font-serif text-headline-md">{won ? `Đúng rồi! ${rows.length}/${DAILY_TRIES}` : "Hết lượt rồi"}</h2>
          <p className="mt-1 flex items-center justify-center gap-3">
            <span lang="zh-Hans" className="text-headline-lg font-bold">{answer.han}</span>
            <span className="text-body-lg text-primary">{answer.pinyin}</span>
            <PronounceButton text={answer.han} />
          </p>
          {saved && <p role="status" className="mt-1 text-label-md font-bold text-secondary">Đã ghi điểm luyện tập.</p>}
          <button type="button" onClick={() => void share()} className="mt-space-sm min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110">{copied ? "Đã chép kết quả ✓" : "Chia sẻ kết quả"}</button>
          <p className="mt-2 text-body-sm text-on-surface-variant">Từ mới xuất hiện lúc 0 giờ (giờ Việt Nam).</p>
        </section>
      )}
    </div>
  );
}
