"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import { playSfx } from "@/lib/feedback/sfx";
import { truthOptionBadge, truthOptionClass, type TruthOptionKind } from "./truth-or-lie-option-style";
import type { CoopRole } from "@/lib/explore/coop/coop-state";
import type { Trial } from "@/lib/practice/truth-or-lie";
import { ROUND_SECONDS, TIMEOUT, emptyPicks, isComplete, mergePicks, resultFor, scoreOf, type Picks } from "@/lib/practice/truth-room";
import { useCountdown } from "./use-countdown";
import { useWordGameScore } from "./use-word-game-score";
import { useTruthRoomChannel } from "./use-truth-room-channel";

const NEXT_MS = 6000;
const tog = (on: boolean) => `min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${on ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`;

interface Props { code: string; role: CoopRole; trials: Trial[]; pinyin: Record<string, string> }

/**
 * Hai thật một giả chơi cùng bạn: hai người nhận cùng bộ câu (suy ra từ mã phòng), trả lời song song; khi CẢ HAI đã chọn thì lộ đáp án, lựa chọn của nhau và lời giải thích,
 * rồi tự sang vòng sau sau vài giây. Mỗi vòng có đồng hồ `ROUND_SECONDS` giây: hết giờ mà chưa chọn thì tính là chưa đúng. Cuối cùng so điểm và ghi XP (x1,5). Tiến độ hai người đi qua kênh Realtime, không lưu lên server.
 */
export function TruthOrLieRoom({ code, role, trials, pinyin }: Props) {
  const rounds = trials.length;
  const [mine, setMine] = useState<Picks>(() => emptyPicks(rounds));
  const [theirs, setTheirs] = useState<Picks>(() => emptyPicks(rounds));
  const [i, setI] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(false);
  const [copied, setCopied] = useState(false);
  const onTheirs = useCallback((p: Picks) => setTheirs((cur) => mergePicks(p, cur)), []);
  const { connected, partnerOnline } = useTruthRoomChannel({ code, role, rounds, mine, onTheirs });

  const done = i >= rounds;
  const bothAnswered = !done && mine[i] !== null && theirs[i] !== null;
  const { saved } = useWordGameScore({ mode: "truthduo", done, correct: scoreOf(trials, mine), total: rounds, duo: true });
  // Đồng hồ vòng: hết giờ mà chưa chọn thì ghi "hết giờ" (không bao giờ trùng câu sai nên không có điểm) và gửi cho đồng đội.
  const answered = !done && mine[i] !== null;
  useEffect(() => {
    if (done || answered) return;
    const t = setTimeout(() => setMine((cur) => cur.map((p, k) => (k === i && p === null ? TIMEOUT : p))), ROUND_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [i, done, answered]);
  const left = useCountdown(i, !done && !answered, ROUND_SECONDS);
  // Cả hai đã trả lời vòng này: tự sang vòng sau sau vài giây (hoặc bấm "Vòng tiếp").
  useEffect(() => {
    if (!bothAnswered) return;
    const t = setTimeout(() => setI((n) => n + 1), NEXT_MS);
    return () => clearTimeout(t);
  }, [bothAnswered, i]);

  function pick(idx: number) {
    if (done || mine[i] !== null) return;
    setMine((cur) => cur.map((p, k) => (k === i ? idx : p)));
    playSfx(idx === trials[i].lieIndex ? "correct" : "wrong");
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/review/truth-or-lie/room/${code}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* tự chép từ thanh địa chỉ */ }
  }

  const status = (
    <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-md">
      <span className="font-extrabold">Phòng <span className="tracking-widest">{code}</span></span>
      <span className="flex items-center gap-1.5 font-bold"><span aria-hidden="true" className={`size-2.5 rounded-full ${partnerOnline ? "bg-secondary" : "bg-outline"}`} />{partnerOnline ? "Đồng đội đang online" : connected ? "Đang chờ đồng đội…" : "Đang kết nối…"}</span>
      {!partnerOnline && <button type="button" onClick={copyLink} className="min-h-11 rounded-full border-2 border-ink bg-primary-container px-4 font-extrabold text-on-primary-container">{copied ? "Đã chép liên kết ✓" : "Chép liên kết mời bạn"}</button>}
    </p>
  );

  if (done) {
    const complete = isComplete(theirs, rounds);
    const a = scoreOf(trials, mine), b = scoreOf(trials, theirs);
    return (
      <div className="flex flex-col gap-space-md">
        {status}
        <div className="rounded-2xl bg-surface-container-low p-space-lg text-center" data-testid="room-done">
          {complete ? (
            <>
              <p className="font-serif text-headline-md">Bạn {a} - {b} Đồng đội</p>
              {saved && <p role="status" className="mt-1 text-label-lg font-bold text-secondary">Đã ghi +{Math.round(a * 150)} điểm luyện tập (x1,5 chơi cùng bạn)</p>}
              <p className="mt-1 text-body-lg font-bold">{{ win: "Bạn thắng!", lose: "Đồng đội thắng, chúc mừng họ!", draw: "Hòa nhau!" }[resultFor(a, b)]}</p>
            </>
          ) : <p className="text-body-lg font-bold" role="status">Bạn tìm đúng {a}/{rounds}. Đang chờ đồng đội làm xong…</p>}
          <Link href="/review/truth-or-lie" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Chơi lại hoặc tạo phòng mới</Link>
        </div>
      </div>
    );
  }

  const trial = trials[i];
  const myPick = mine[i], theirPick = theirs[i];
  return (
    <div className="flex flex-col gap-space-md">
      {status}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-lg font-extrabold">Vòng {i + 1}/{rounds} · {trial.topic}</p>
        {!answered && <p role="timer" aria-label={`Còn ${left} giây`} className={`min-w-20 rounded-full border-2 border-ink px-3 py-1 text-center text-label-lg font-extrabold ${left <= 5 ? "animate-pulse bg-error text-on-error" : "bg-surface-container-lowest"}`}>⏱ {left}s</p>}
        <div role="group" aria-label="Gợi ý" className="flex gap-1.5">
          <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={tog(showPinyin)}>Pinyin</button>
          <button type="button" aria-pressed={showVi} onClick={() => setShowVi((v) => !v)} className={tog(showVi)}>Nghĩa</button>
        </div>
      </div>
      <p className="text-body-lg font-bold">Hai câu đúng, một câu SAI. Chọn câu sai: ai chọn đúng nhiều hơn là thắng.</p>
      <ul className="flex flex-col gap-2">
        {trial.options.map((o, idx) => {
          const isLie = idx === trial.lieIndex;
          const kind: TruthOptionKind = !bothAnswered ? (myPick === idx ? "selected" : "idle") : isLie ? "lie" : myPick === idx || theirPick === idx ? "wrong-pick" : "other";
          const badge = truthOptionBadge(kind);
          return (
            <li key={o.zh} className="flex items-stretch gap-2">
              <button type="button" onClick={() => pick(idx)} disabled={myPick !== null} aria-pressed={myPick === idx}
                className={truthOptionClass(kind)}>
                <span lang="zh-Hans" className={`block text-body-lg font-bold ${showPinyin ? "leading-[2.2]" : ""}`}><RubyLine zh={o.zh} pinyin={pinyin[o.zh]} show={showPinyin} /></span>
                {(showVi || bothAnswered) && <span className="block text-body-sm text-on-surface-variant">{o.vi}</span>}
                {bothAnswered && (
                  <span className="block">
                    {badge && <span className={badge.className}>{badge.text}</span>}
                    <span className="ml-2 text-label-md font-extrabold">{myPick === idx && "· bạn chọn "}{theirPick === idx && "· đồng đội chọn"}</span>
                  </span>
                )}
              </button>
              <PronounceButton text={o.zh} className="size-14 self-center" />
            </li>
          );
        })}
      </ul>
      {myPick !== null && !bothAnswered && <p role="status" className="rounded-xl bg-surface-container-low p-space-sm text-body-md font-bold">{myPick === TIMEOUT ? "Bạn đã hết giờ." : "Bạn đã chọn."} Đang chờ đồng đội…</p>}
      {bothAnswered && (
        <div role="status" className="rounded-xl bg-surface-container-low p-space-sm">
          <p className="text-body-md font-bold">{myPick === trial.lieIndex ? "Bạn chọn đúng!" : myPick === TIMEOUT ? "Bạn hết giờ." : "Bạn chưa đúng."} {theirPick === trial.lieIndex ? "Đồng đội cũng đúng." : theirPick === TIMEOUT ? "Đồng đội hết giờ." : "Đồng đội chưa đúng."} {trial.explain}</p>
          <button type="button" onClick={() => setI((n) => n + 1)} className="mt-2 min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">{i + 1 === rounds ? "Xem kết quả" : "Vòng tiếp"} (tự chuyển sau vài giây)</button>
        </div>
      )}
    </div>
  );
}
