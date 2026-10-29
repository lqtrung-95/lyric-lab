"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePetView } from "@/components/pet/use-pet-view";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { Button3d } from "@/components/ui/button-3d";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { GameWord } from "@/lib/games/game-word";
import { LIVES, answerTower, frontMonster, initTower, stepTower, type TowerState } from "@/lib/games/tower-engine";
import { EMPTY_TOWER_RECORD, TOWER_RECORD_EVENT, TOWER_RECORD_KEY, mergeTowerRecord, parseTowerRecord } from "@/lib/games/tower-record";
import type { PetBurst } from "@/lib/pet/pet-burst";
import { GameKeyframes } from "./game-keyframes";
import { SoundToggle } from "./sound-toggle";
import { TowerScene } from "./tower-scene";
import { useGameLoop } from "./use-game-loop";
import { useTowerSound } from "./use-tower-sound";

const chip = "rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-sm font-bold";

/**
 * Pet thủ thành: quái mang chữ Hán đi về phía nhà, pet là tháp. Nhìn con quái đầu hàng (viền vàng) và chọn đúng ÂM ĐỌC (các lựa chọn chỉ khác thanh điệu):
 * đúng thì pet bắn hạ nó (đủ 5 combo thì bắn cả đàn); sai thì quái lọt qua và lao vào nhà. Mất hết 5 tim là thua. Không tính XP; kỷ lục lưu trên thiết bị này.
 */
export function TowerGame({ words }: { words: GameWord[] }) {
  const data = usePetView();
  const [record, setRecord] = useLocalJson(TOWER_RECORD_KEY, TOWER_RECORD_EVENT, parseTowerRecord, EMPTY_TOWER_RECORD);
  const [s, setS] = useState<TowerState>(initTower);
  const [started, setStarted] = useState(false);
  const species = data?.pet.species ?? "cat";
  const active = started && !s.over;
  useGameLoop((dt) => setS((cur) => stepTower(cur, dt, words, Math.random)), active);
  useTowerSound(s, species, active);

  const front = frontMonster(s);
  const choose = (i: number) => setS((cur) => answerTower(cur, i));
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { const n = Number(e.key); if (n >= 1 && n <= 3 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); choose(n - 1); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
  useEffect(() => {
    if (!s.over) return;
    setRecord(mergeTowerRecord(record, s.score, s.wave).record);
  }, [s.over]); // eslint-disable-line react-hooks/exhaustive-deps
  const burst = useMemo<PetBurst | null>(() => (s.reveal ? { key: s.answered, kind: !s.reveal.ok ? "try" : s.combo > 0 && s.combo % 5 === 0 ? "cheer" : "tap" } : null), [s.reveal?.ok, s.answered, s.combo]); // eslint-disable-line react-hooks/exhaustive-deps
  const restart = () => { setS(initTower()); setStarted(true); };

  if (data === undefined) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải bạn nhỏ của bạn…</p>;
  if (data === null) return <p className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-md">Bạn cần có một bạn nhỏ làm tháp canh. <Link href="/app" className="font-bold underline">Nhận nuôi ở trang chủ</Link> rồi quay lại nhé.</p>;
  const { pet, view } = data;
  if (s.over) {
    return (
      <PracticeSummary
        title={s.score > 0 && s.score >= record.bestScore ? `${pet.name} giữ nhà xuất sắc, kỷ lục mới!` : `Quái vào nhà rồi, ${pet.name} cần bạn giúp thêm`}
        stats={[{ label: "Điểm", value: String(s.score) }, { label: "Quái đã hạ", value: String(s.kills) }, { label: "Đợt", value: String(s.wave) }, { label: "Combo dài nhất", value: String(s.bestCombo) }]}
        missed={s.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={restart}
      />
    );
  }
  const sinceSuper = s.combo % 5;
  return (
    <div className="mx-auto max-w-3xl">
      <GameKeyframes />
      <style>{`@media (prefers-reduced-motion: no-preference){@keyframes tw-rush{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-6px) rotate(6deg)}}.tw-rush{animation:tw-rush .18s linear infinite}}`}</style>
      <div className="mb-space-sm flex flex-wrap items-center gap-2">
        <span className={chip}>🏆 {s.score}</span>
        <span className={chip}>Đợt {s.wave}</span>
        <span className={chip} aria-label={`${s.lives} trên ${LIVES} tim`}>{Array.from({ length: LIVES }, (_, i) => (i < s.lives ? "❤️" : "🖤")).join("")}</span>
        <span className={chip} title="Đủ 5 combo, pet bắn cả đàn">⭐ {sinceSuper}/5{s.combo >= 2 ? ` · combo ×${s.combo}` : ""}</span>
        <SoundToggle className={`${chip} min-h-11 min-w-11`} />
      </div>
      <div className="relative isolate aspect-[16/10] w-full select-none overflow-hidden rounded-3xl border-2 border-ink">
        <TowerScene s={s} species={species} stage={view.growth.stage} mood={s.shake > 0 ? "hungry" : "happy"} accessories={view.accessories} burst={burst} />
        {!started && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center text-white">
            <p className="text-xl font-bold">{pet.name} giữ nhà, bạn chọn âm đọc</p>
            <p className="max-w-md text-sm text-white/85">Chọn đúng âm đọc (đúng thanh điệu) của con quái viền vàng thì {pet.name} bắn hạ nó. Chọn sai, quái lọt qua và lao vào nhà. Phím 1, 2, 3 cũng chọn được.</p>
            <button type="button" onClick={() => setStarted(true)} className="min-h-12 rounded-full bg-amber-400 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Bắt đầu giữ nhà</button>
            {record.bestScore > 0 && <p className="text-xs text-white/75">Kỷ lục: {record.bestScore} điểm, tới đợt {record.bestWave}</p>}
          </div>
        )}
      </div>
      <p role="status" className="mt-space-sm min-h-8 text-center text-body-md font-bold">
        {s.reveal ? (s.reveal.ok ? `Trúng! ${s.reveal.han} đọc là ${s.reveal.pinyin}` : `Quái lọt qua rồi! ${s.reveal.han} phải đọc là ${s.reveal.pinyin}`) : front ? "Chọn âm đọc của chữ có viền vàng:" : started ? "Quái đang tới…" : ""}
      </p>
      <div className="flex items-stretch justify-center gap-2">
        {front && <span className="flex items-center gap-1"><span lang="zh-Hans" className="font-serif text-hanzi-display">{front.word.han}</span><PronounceButton text={front.word.han} /></span>}
      </div>
      <ul className="mt-1 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <Button3d type="button" variant="tertiary" className="w-full" disabled={!active || !front} onClick={() => choose(i)}>
              <span className="mr-1 text-on-surface-variant">{i + 1}</span><span className="text-pinyin-reading">{front ? front.options[i] : "…"}</span>
            </Button3d>
          </li>
        ))}
      </ul>
      {front?.word.meaning && <p className="mt-1 text-center text-label-md text-on-surface-variant">Nghĩa: {front.word.meaning}</p>}
    </div>
  );
}
