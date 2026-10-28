"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useCountdown } from "@/components/practice/use-countdown";
import { useWordGameScore } from "@/components/practice/use-word-game-score";
import { DUEL_WORDS, duelResult, type DuelRole, type DuelState } from "@/lib/games/duel";
import type { GameWord } from "@/lib/games/game-word";
import { DuelRace } from "./duel-race";
import { useDuelChannel } from "./use-duel-channel";

const COUNTDOWN = 3;
const fmt = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

/**
 * Đấu 1–1: hai người cùng bộ từ (suy ra từ mã phòng), bấm "Sẵn sàng", đếm ngược 3 giây rồi đua gõ pinyin; ai về đích nhanh hơn (đã cộng phạt bỏ qua) thắng.
 * Tiến độ hai người đi qua kênh Realtime, không lưu lên máy chủ; mỗi người tự đo giờ của mình nên chênh lệch mạng không ảnh hưởng kết quả.
 */
export function DuelRoom({ code, role, words }: { code: string; role: DuelRole; words: GameWord[] }) {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(0);
  const [finished, setFinished] = useState<{ ms: number; solved: number } | null>(null);
  const [theirs, setTheirs] = useState<DuelState | null>(null);
  const [racing, setRacing] = useState(false);
  const [copied, setCopied] = useState(false);
  const onTheirs = useCallback((s: DuelState) => setTheirs(s), []);
  const mine: DuelState = { from: role, ready, done, finishedMs: finished?.ms ?? null };
  const { connected, partnerOnline } = useDuelChannel({ code, role, mine, onTheirs });
  const bothReady = ready && !!theirs?.ready;
  const left = useCountdown(bothReady, bothReady && !racing, COUNTDOWN);
  useEffect(() => {
    if (!bothReady) return;
    const t = setTimeout(() => setRacing(true), COUNTDOWN * 1000);
    return () => clearTimeout(t);
  }, [bothReady]);
  const { saved } = useWordGameScore({ mode: "duel", done: finished !== null, correct: finished?.solved ?? 0, total: DUEL_WORDS, duo: true });

  async function copyLink() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/review/duel/room/${code}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* tự chép từ thanh địa chỉ */ }
  }
  const status = (
    <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-md">
      <span className="font-extrabold">Phòng <span className="tracking-widest">{code}</span></span>
      <span className="flex items-center gap-1.5 font-bold"><span aria-hidden="true" className={`size-2.5 rounded-full ${partnerOnline ? "bg-secondary" : "bg-outline"}`} />{partnerOnline ? "Đối thủ đang online" : connected ? "Đang chờ đối thủ…" : "Đang kết nối…"}</span>
      {!partnerOnline && <button type="button" onClick={copyLink} className="min-h-11 rounded-full border-2 border-ink bg-primary-container px-4 font-extrabold text-on-primary-container">{copied ? "Đã chép liên kết ✓" : "Chép liên kết thách bạn"}</button>}
    </p>
  );

  if (finished) {
    const other = theirs?.finishedMs ?? null;
    return (
      <div className="flex flex-col gap-space-md">
        {status}
        <div className="rounded-2xl bg-surface-container-low p-space-lg text-center" data-testid="duel-done">
          {other === null ? <p role="status" className="text-body-lg font-bold">Bạn về đích sau {fmt(finished.ms)}. Đang chờ đối thủ…</p> : (
            <>
              <p className="font-serif text-headline-md">Bạn {fmt(finished.ms)} - {fmt(other)} Đối thủ</p>
              <p className="mt-1 text-body-lg font-bold">{{ win: "Bạn thắng!", lose: "Đối thủ nhanh hơn, chúc mừng họ!", draw: "Hòa nhau!" }[duelResult(finished.ms, other)]}</p>
            </>
          )}
          {saved && <p role="status" className="mt-1 text-label-lg font-bold text-secondary">Đã ghi điểm luyện tập (x1,5 chơi cùng bạn)</p>}
          <Link href="/review/duel" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Đấu lại hoặc tạo phòng mới</Link>
        </div>
      </div>
    );
  }
  if (racing) return <div className="flex flex-col gap-space-md">{status}<DuelRace words={words} theirsDone={theirs?.done ?? 0} onProgress={setDone} onFinish={(ms, solved) => setFinished({ ms, solved })} /></div>;
  return (
    <div className="flex flex-col gap-space-md">
      {status}
      <div className="rounded-2xl bg-surface-container-low p-space-lg text-center">
        {bothReady ? <p role="timer" className="font-serif text-[4rem] font-bold leading-none">{left || "Đi!"}</p> : (
          <>
            <p className="text-body-lg font-bold">{DUEL_WORDS} từ Hán, gõ pinyin nhanh nhất để thắng.</p>
            <p className="mt-1 text-body-md text-on-surface-variant">{ready ? "Đã sẵn sàng. Đang chờ đối thủ bấm sẵn sàng…" : "Bấm sẵn sàng khi bạn đã chuẩn bị bàn phím."}</p>
            <button type="button" disabled={ready} onClick={() => setReady(true)} className="mt-space-md min-h-12 rounded-full bg-primary px-8 text-label-lg font-extrabold text-on-primary hover:brightness-110 disabled:opacity-60">Sẵn sàng</button>
          </>
        )}
      </div>
    </div>
  );
}
