"use client";

import { useState } from "react";
import { GamePet, type GamePetEvent } from "@/components/games/game-pet";
import { usePetView } from "@/components/pet/use-pet-view";
import { Button3d } from "@/components/ui/button-3d";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { buildChallengeUrl, challengeVerdict, type Challenge } from "@/lib/challenge/challenge-link";
import { sfx } from "@/lib/games/arcade-sfx";
import { HAN_VIET_ROUNDS, hanVietTitle, makeHanVietQuiz, type HanVietQuestion } from "@/lib/games/han-viet-quiz";
import type { HanVietWord } from "@/lib/games/han-viet-words";
import { newSeed } from "@/lib/games/seeded-rng";

const VERDICT_TEXT = {
  beat: (from: string, s: number) => `Bạn vượt ${from} rồi (${s} điểm)!`,
  tie: (from: string) => `Hòa với ${from}! Chơi lại để phá kỷ lục nhé.`,
  behind: (from: string) => `${from} nhỉnh hơn một chút. Thử lại xem!`,
} as const;

/**
 * Đoán chữ Hán từ âm Hán Việt: hiện "đại học", chọn 大学 trong 4 lựa chọn. 10 câu, không tính XP, chơi lần nào cũng được bộ câu mới.
 * Có `challenge` (từ link bạn bè gửi) thì dùng đúng hạt giống đó để cùng đề, hiện điểm của người thách và so kết quả. Kết quả chia sẻ được kèm link thách.
 */
export function HanVietGame({ words, challenge }: { words: HanVietWord[]; challenge: Challenge | null }) {
  const data = usePetView();
  const [seed, setSeed] = useState(challenge?.seed ?? "");
  const [qs, setQs] = useState<HanVietQuestion[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<HanVietWord[]>([]);
  const [over, setOver] = useState(false);
  const [petEv, setPetEv] = useState<GamePetEvent | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const start = (useChallenge: boolean) => {
    const s = useChallenge && challenge ? challenge.seed : newSeed();
    setSeed(s); setQs(makeHanVietQuiz(words, s)); setI(0); setPicked(null); setScore(0); setMissed([]); setOver(false); setNote(null);
  };
  const q = qs[i];
  const pick = (han: string) => {
    if (!q || picked !== null) return;
    const ok = han === q.word.han;
    setPicked(han);
    if (ok) { setScore((s) => s + 1); sfx.pop(0); } else { setMissed((m) => [...m, q.word]); sfx.buzz(); }
    setPetEv((e) => ({ key: (e?.key ?? 0) + 1, kind: ok ? "hit" : "miss" }));
  };
  const next = () => {
    if (i + 1 >= qs.length) { setOver(true); sfx.gameOver(); return; }
    setI(i + 1); setPicked(null);
  };
  const share = async () => {
    const url = buildChallengeUrl(`${window.location.origin}/review/han-viet`, { seed, score, total: qs.length, from: data?.pet.name ?? "" });
    const text = `Mình đoán đúng ${score}/${qs.length} từ tiếng Trung chỉ nhờ biết Hán Việt (${hanVietTitle(score, qs.length)}). Thử vượt mình đi!`;
    try {
      if (navigator.share) await navigator.share({ title: "Đoán chữ Hán từ Hán Việt", text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setNote("Đã sao chép link thách bạn bè."); }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setNote("Chưa chia sẻ được. Thử lại nhé.");
    }
  };

  if (words.length < 4) return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được kho từ. Thử tải lại trang nhé.</p>;
  if (over) {
    const verdict = challenge && seed === challenge.seed ? challengeVerdict(score, challenge.score) : null;
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-surface-container-low p-space-md text-center">
        <p className="text-label-md font-bold text-on-surface-variant">{hanVietTitle(score, qs.length)}</p>
        <h2 role="status" className="mt-1 text-headline-lg">{score}/{qs.length}</h2>
        {verdict && challenge && <p className="mt-1 text-body-md font-bold">{VERDICT_TEXT[verdict](challenge.from, score)}</p>}
        {missed.length > 0 && (
          <ul className="mt-space-sm flex flex-col gap-1 text-left">
            {missed.map((w) => <li key={w.han} className="rounded-xl bg-surface-container-lowest px-3 py-1"><span lang="zh" className="font-serif text-lg">{w.han}</span> <span className="text-primary">{w.pinyin}</span> · {w.sinoViet} · {w.meaning}</li>)}
          </ul>
        )}
        <div className="mt-space-sm flex flex-wrap justify-center gap-2">
          <Button3d type="button" variant="bright" onClick={() => void share()}>Thách bạn bè</Button3d>
          <Button3d type="button" onClick={() => start(false)}>Chơi lại</Button3d>
        </div>
        {note && <p role="status" className="mt-2 text-label-md font-bold">{note}</p>}
      </div>
    );
  }
  if (!q) {
    return (
      <div className="mx-auto max-w-md text-center">
        {challenge && <p className="mb-space-sm rounded-2xl bg-secondary-container p-space-sm text-body-md font-bold text-on-secondary-container">{challenge.from} đạt {challenge.score}/{challenge.total}. Bạn có vượt được không?</p>}
        <p className="text-body-md text-on-surface-variant">{HAN_VIET_ROUNDS} câu: xem âm Hán Việt, chọn đúng chữ Hán. Người Việt có lợi thế riêng đấy! Không tính XP, chỉ để vui.</p>
        <Button3d type="button" variant="bright" className="mt-space-sm" onClick={() => start(!!challenge)}>{challenge ? "Nhận lời thách" : "Bắt đầu"}</Button3d>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center justify-between text-label-lg font-extrabold">
        <span>Câu {i + 1}/{qs.length}</span>
        <GamePet event={petEv} />
        <span>✓ {score}</span>
      </div>
      <div className="mt-space-sm rounded-2xl bg-surface-container-low p-space-md text-center">
        <p className="text-label-md text-on-surface-variant">Chữ Hán nào đọc là</p>
        <p role="status" className="text-headline-lg font-extrabold text-primary">{q.word.sinoViet}</p>
      </div>
      <ul className="mt-space-sm grid grid-cols-2 gap-3">
        {q.options.map((o) => {
          const right = picked !== null && o === q.word.han;
          const wrong = picked === o && o !== q.word.han;
          return (
            <li key={o}>
              <button type="button" lang="zh" disabled={picked !== null} onClick={() => pick(o)} className={`min-h-16 w-full rounded-2xl border-2 px-2 font-serif text-hanzi-display ${right ? "border-secondary bg-secondary-container" : wrong ? "border-dashed border-error opacity-70" : "border-ink bg-surface-container-lowest"}`}>
                {o}{right ? " ✓" : wrong ? " ✗" : ""}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null && (
        <div role="status" className="mt-space-sm rounded-2xl bg-surface-container-low p-space-sm">
          <div className="flex items-center gap-2"><span lang="zh" className="font-serif text-hanzi-display">{q.word.han}</span><span className="text-pinyin-reading text-primary">{q.word.pinyin}</span><PronounceButton text={q.word.han} /></div>
          <p className="text-body-md">{q.word.meaning}</p>
          <Button3d type="button" variant="bright" className="mt-2" onClick={next}>{i + 1 >= qs.length ? "Xem kết quả" : "Câu tiếp"}</Button3d>
        </div>
      )}
    </div>
  );
}
