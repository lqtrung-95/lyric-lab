"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GamePet, type GamePetEvent } from "@/components/games/game-pet";
import { GameKeyframes } from "@/components/games/game-keyframes";
import { Button3d } from "@/components/ui/button-3d";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { sfx } from "@/lib/games/arcade-sfx";
import type { GameWord } from "@/lib/games/game-word";
import { DUEL_ROUNDS, DUEL_ROUND_MS, EMPTY_DUEL_RECORD, PET_DUEL_RECORD_EVENT, PET_DUEL_RECORD_KEY, PET_DUEL_STYLE, addDuelOutcome, duelOutcome, makeDuelRound, parseDuelRecord, petPlan, type DuelRound, type DuelWinner, type PetPlan } from "@/lib/pet/pet-duel";
import { PET_SPECIES_LABELS } from "@/lib/pet/pet-logic";
import { PetDuelResult } from "./pet-duel-result";
import { useLocalJson } from "./use-local-json-store";
import { usePetView } from "./use-pet-view";

interface Q { no: number; round: DuelRound; plan: PetPlan; wrongPick: string | null; winner: DuelWinner | null; petSlip: boolean }
const NEXT_MS = 1500;

/**
 * Đấu với pet: 5 câu, nhìn pinyin và nghĩa rồi chọn chữ Hán; pet cũng bấm theo tính cách loài và độ lớn. Ai bấm đúng trước được điểm.
 * Bấm sai thì khóa câu đó. Không ghi XP (kỷ lục thắng/thua chỉ lưu ở thiết bị này). Tiếng riêng của game; pet chỉ phản ứng bằng hình.
 */
export function PetDuelGame({ words }: { words: GameWord[] }) {
  const data = usePetView();
  const [record, setRecord] = useLocalJson(PET_DUEL_RECORD_KEY, PET_DUEL_RECORD_EVENT, parseDuelRecord, EMPTY_DUEL_RECORD);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [q, setQ] = useState<Q | null>(null);
  const [score, setScore] = useState({ user: 0, pet: 0 });
  const [ev, setEv] = useState<GamePetEvent | null>(null);
  const used = useRef(new Set<string>());
  const settled = useRef(0);
  const species = data?.pet.species;
  const stage = data?.view.growth.stage ?? 1;

  const nextQ = (no: number): Q | null => {
    const round = makeDuelRound(words, used.current, Math.random);
    if (!round || !species) return null;
    used.current.add(round.answer.han);
    return { no, round, plan: petPlan(species, stage, Math.random), wrongPick: null, winner: null, petSlip: false };
  };
  const react = (kind: GamePetEvent["kind"]) => setEv((e) => ({ key: (e?.key ?? 0) + 1, kind }));
  const settle = (no: number, w: DuelWinner) => {
    if (settled.current === no) return;
    settled.current = no;
    setQ((c) => (c && c.no === no ? { ...c, winner: w } : c));
    if (w === "user") { setScore((s) => ({ ...s, user: s.user + 1 })); sfx.pop(0); react("miss"); }
    if (w === "pet") { setScore((s) => ({ ...s, pet: s.pet + 1 })); if (species) sfx.petChirp(species); react("hit"); }
  };
  const start = () => { used.current = new Set(); settled.current = 0; setScore({ user: 0, pet: 0 }); setEv(null); setQ(nextQ(1)); setPhase("play"); };
  const finish = () => {
    const outcome = duelOutcome(score.user, score.pet);
    setRecord(addDuelOutcome(record, outcome));
    if (outcome === "win") sfx.petCheer(); else if (outcome === "lose") sfx.petHappy(species); else sfx.petBlip();
    setPhase("over");
  };
  const pick = (han: string) => {
    if (phase !== "play" || !q || q.winner !== null || q.wrongPick) return;
    if (han === q.round.answer.han) settle(q.no, "user");
    else { sfx.buzz(); setQ({ ...q, wrongPick: han }); }
  };

  // Pet bấm đúng lúc đã định (đúng thì ghi điểm, sai thì "bấm nhầm"); hết giờ thì hòa câu.
  useEffect(() => {
    if (phase !== "play" || !q || q.winner !== null) return;
    const no = q.no;
    const slip = setTimeout(() => (q.plan.correct ? settle(no, "pet") : setQ((c) => (c && c.no === no ? { ...c, petSlip: true } : c))), q.plan.atMs);
    const out = setTimeout(() => settle(no, "none"), DUEL_ROUND_MS);
    return () => { clearTimeout(slip); clearTimeout(out); };
  }, [phase, q?.no, q?.winner]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== "play" || !q || q.winner === null) return;
    const t = setTimeout(() => (q.no >= DUEL_ROUNDS ? finish() : setQ(nextQ(q.no + 1))), NEXT_MS);
    return () => clearTimeout(t);
  }, [phase, q?.no, q?.winner]); // eslint-disable-line react-hooks/exhaustive-deps

  if (data === undefined) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải bạn nhỏ của bạn…</p>;
  if (data === null) return <p className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-md">Bạn chưa có bạn nhỏ để đấu cùng. <Link href="/app" className="font-bold underline">Nhận nuôi ở trang chủ</Link> rồi quay lại nhé.</p>;
  const name = data.pet.name;
  if (phase === "over") return <PetDuelResult name={name} outcome={duelOutcome(score.user, score.pet)} user={score.user} pet={score.pet} record={record} onAgain={start} />;

  const status = !q ? "" : q.winner === "user" ? `Bạn nhanh hơn! ${name} tiếc ghê.` : q.winner === "pet" ? `${name} nhanh tay hơn!` : q.winner === "none" ? "Hết giờ, hòa câu này." : q.petSlip ? `${name} bấm nhầm rồi!` : q.wrongPick ? "Bạn bấm nhầm, chờ câu sau nhé." : `${name} đang nghĩ…`;
  return (
    <div className="mx-auto max-w-md">
      <GameKeyframes />
      <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-space-sm">
        <GamePet className="size-20" event={ev} />
        <div className="min-w-0 flex-1">
          <p className="text-label-lg font-extrabold">Bạn {score.user} – {score.pet} {name}</p>
          <p className="text-label-md text-on-surface-variant">{PET_SPECIES_LABELS[data.pet.species]} {PET_DUEL_STYLE[data.pet.species].trait}</p>
          {q && <p role="status" aria-live="polite" className="mt-1 text-body-md font-bold">{status}</p>}
        </div>
      </div>
      {phase === "idle" || !q ? (
        <div className="mt-space-md text-center">
          <p className="text-body-md text-on-surface-variant">{DUEL_ROUNDS} câu. Xem pinyin và nghĩa, bấm đúng chữ Hán trước {name}. Bấm sai thì mất lượt câu đó. Không tính XP, chỉ để vui.</p>
          <p className="mt-1 text-label-md text-on-surface-variant">Thành tích: thắng {record.win} · thua {record.lose} · hòa {record.draw}</p>
          <Button3d type="button" variant="bright" className="mt-space-sm" onClick={start}>Bắt đầu đấu</Button3d>
        </div>
      ) : (
        <>
          <p className="mt-space-sm text-center text-label-md text-on-surface-variant">Câu {q.no}/{DUEL_ROUNDS}</p>
          <div className="mt-1 flex items-center justify-center gap-3 rounded-2xl bg-surface-container-low p-space-sm">
            <span className="flex flex-col items-center leading-tight">
              <span className="text-headline-md font-extrabold text-primary">{q.round.answer.pinyin}</span>
              {q.round.answer.meaning && <span className="text-body-md text-on-surface-variant">{q.round.answer.meaning}</span>}
            </span>
            <PronounceButton text={q.round.answer.han} />
          </div>
          {q.winner === null && <div className="mx-auto mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container-high"><div key={q.no} className="bz-shrink h-full rounded-full bg-primary" style={{ "--win": `${DUEL_ROUND_MS}ms` } as React.CSSProperties} /></div>}
          <ul className="mt-space-sm grid grid-cols-2 gap-3">
            {q.round.options.map((o) => {
              const right = q.winner !== null && o.han === q.round.answer.han;
              const wrong = q.wrongPick === o.han;
              return (
                <li key={o.han}>
                  <button type="button" lang="zh" disabled={q.winner !== null || !!q.wrongPick} onClick={() => pick(o.han)}
                    className={`min-h-16 w-full rounded-2xl border-2 px-2 font-serif text-hanzi-display ${right ? "border-secondary bg-secondary-container" : wrong ? "border-dashed border-error opacity-70" : "border-ink bg-surface-container-lowest"}`}>
                    {o.han}{right ? " ✓" : wrong ? " ✗" : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
