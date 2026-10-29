"use client";

import Link from "next/link";
import { useState } from "react";
import { useGameSummary } from "@/components/layout/use-game-summary";
import { useStreak } from "@/components/streak/use-streak";
import { SoundToggle } from "@/components/games/sound-toggle";
import { Button3d } from "@/components/ui/button-3d";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PET_NAME_MAX, PET_SPECIES_LABELS, cleanPetName, daysSinceStudy, petGrowth, petMood, unlockedAccessories, type Pet, type PetMood, type PetSpecies, type PetStage } from "@/lib/pet/pet-logic";
import { dailyGoalProgress } from "@/lib/streak/daily-goal";
import { PET_SPECIES_READY, PetSprite } from "./pet-sprite";
import { usePet } from "./use-pet";
import { useReviewSummary } from "@/components/review/use-review-summary";
import { playChinese } from "@/lib/speech/play-chinese";
import type { PetSnapshot } from "@/lib/pet/pet-reaction";
import { reviewWordLabel, type PetReviewWord } from "@/lib/pet/pet-review-word";
import { usePetGift } from "./use-pet-gift";
import { sfx } from "@/lib/games/arcade-sfx";
import type { PetBurst, PetBurstKind } from "@/lib/pet/pet-burst";
import type { EchoTier } from "@/lib/pet/pet-echo";
import { PetBurstFx } from "./pet-burst-fx";
import { PetChat } from "./pet-chat";
import { PetEcho } from "./pet-echo";
import { PetFeed } from "./pet-feed";
import { usePetEvolution } from "./use-pet-evolution";
import { usePetTalk } from "./use-pet-talk";

const STAGE_NAMES: readonly string[] = ["Con non", "Thiếu niên", "Trưởng thành"];
const MOOD_TEXT: Record<PetMood, (name: string) => string> = {
  happy: (n) => `${n} no bụng và vui lắm. Hôm nay bạn đã đạt mục tiêu!`,
  hungry: (n) => `${n} đang đói chữ. Học một chút là ${n} no ngay.`,
  sleepy: (n) => `${n} đang ngủ gật. Quay lại học là ${n} dậy liền, không mất gì cả.`,
};

/** Thẻ linh vật ở trang chủ: chưa có thì mời nhận nuôi; có rồi thì hiện hình, giai đoạn, tiến độ tới giai đoạn sau và lời nhắn theo tâm trạng. */
export function PetCard() {
  const { pet, adopt } = usePet();
  const game = useGameSummary();
  const streak = useStreak();
  const review = useReviewSummary();
  const [feeding, setFeeding] = useState(false);
  const [echoing, setEchoing] = useState(false);
  const [chatting, setChatting] = useState(false);
  const echoWord = review?.peek[0] ?? null;
  const { gift, take } = usePetGift();
  const [chewKey, setChewKey] = useState(0);
  // Hiệu ứng hạt + tiếng cho tương tác ngoài hình pet (cho ăn, tập nói, quà, nhận nuôi, tiến hóa).
  const [extra, setExtra] = useState<PetBurst | null>(null);
  const fx = (kind: PetBurstKind) => setExtra((b) => ({ key: (b?.key ?? 0) + 1, kind }));
  const [seenGift, setSeenGift] = useState<string | null>(null);
  const [wasEmpty, setWasEmpty] = useState(false);
  const [adoptFxDone, setAdoptFxDone] = useState(false);
  const [seenEvolved, setSeenEvolved] = useState<number | null>(null);
  // Lớn theo XP kiếm được kể từ lúc nhận nuôi (chưa có pet thì chưa có mốc, tính từ 0).
  const growth = petGrowth(game?.xp.total ?? 0, pet?.baseXp ?? 0);
  // Gọi trước các lệnh return sớm để thứ tự hook không đổi giữa các lần vẽ.
  const evolved = usePetEvolution(growth.stage, game !== null && game !== undefined && pet != null);
  // Kích hiệu ứng ngay lúc vẽ khi có thay đổi (lint cấm setState trong effect): quà mới, vừa nhận nuôi, vừa tiến hóa.
  const giftId = gift ? `${gift.videoId}:${gift.term}` : null;
  if (giftId !== seenGift) { setSeenGift(giftId); if (giftId) fx("gift"); }
  if (pet === null && !wasEmpty) setWasEmpty(true);
  if (pet && wasEmpty && !adoptFxDone) { setAdoptFxDone(true); fx("adopt"); }
  if (evolved && evolved !== seenEvolved) { setSeenEvolved(evolved); fx("evolve"); }
  if (pet === undefined) return null;
  if (pet === null) return <AdoptPet ready={game !== undefined} onAdopt={(species, name) => adopt({ species, name, adoptedAt: new Date().toISOString(), baseXp: game?.xp.total ?? 0 })} />;

  const goal = dailyGoalProgress(streak?.todayItems ?? 0, streak?.dailyGoal ?? 0);
  const mood = streak ? petMood(goal, daysSinceStudy(streak)) : "hungry";
  const nextStage = (STAGE_NAMES[growth.stage] ?? "").toLowerCase();
  const accessories = unlockedAccessories(streak?.longest ?? 0);
  // Dữ liệu game/chuỗi chưa tải xong thì chưa có ảnh chụp (không phản ứng với số tạm thời).
  // Không cần useMemo: `usePetTalk` so từng trường chứ không so địa chỉ đối tượng.
  const snapshot: PetSnapshot | null = game && streak ? { level: game.level.n, streak: game.streak.current, mood } : null;
  return (
    <section aria-labelledby="pet-heading" className="card-ink flex flex-wrap items-center gap-x-space-md gap-y-space-sm p-space-md">
      <PetTouch pet={pet} stage={growth.stage} mood={mood} accessories={accessories.map((a) => a.id)} words={review?.peek ?? NO_WORDS} snapshot={snapshot} chewKey={chewKey} extra={extra} />
      <div className="min-w-[14rem] flex-1">
        <h2 id="pet-heading" className="text-headline-md">{pet.name} <span className="text-label-md font-bold text-on-surface-variant">· {PET_SPECIES_LABELS[pet.species]} · {(STAGE_NAMES[growth.stage - 1] ?? "").toLowerCase()}</span></h2>
        {evolved && <p role="status" className="mt-1 inline-block rounded-full bg-primary-container px-3 py-0.5 text-label-md font-extrabold">Tiến hóa! {pet.name} đã lên giai đoạn {(STAGE_NAMES[evolved - 1] ?? "").toLowerCase()}</p>}
        <p role="status" className="mt-1 text-body-md">{MOOD_TEXT[mood](pet.name)}</p>
        {growth.maxed ? (
          <p className="mt-2 text-label-md font-bold text-secondary">{pet.name} đã trưởng thành!</p>
        ) : (
          <div className="mt-2">
            <ProgressBar size="sm" value={growth.progressXp} max={growth.nextXp} label={`Tiến độ lên giai đoạn ${nextStage}`} />
            <p className="mt-1 text-label-md text-on-surface-variant">Còn {growth.nextXp - growth.progressXp} XP nữa là lên giai đoạn {nextStage}</p>
          </div>
        )}
        {accessories.length > 0 && <p className="mt-1 text-label-md text-on-surface-variant">Phụ kiện đã mở: {accessories.map((a) => a.label).join(", ")}</p>}
        {!feeding && !echoing && !chatting && (
          <div className="mt-space-sm flex flex-wrap gap-2">
            {(review?.total ?? 0) > 0 && <Button3d type="button" variant="bright" onClick={() => { sfx.petBlip(); setFeeding(true); }}>Cho {pet.name} ăn thẻ</Button3d>}
            <Button3d type="button" onClick={() => { sfx.petBlip(); fx("tap"); setChatting(true); }}>Nói chuyện với {pet.name}</Button3d>
            {echoWord && <Button3d type="button" onClick={() => { sfx.petBlip(); setEchoing(true); }}>Tập nói cùng {pet.name}</Button3d>}
          </div>
        )}
      </div>
      {gift && (
        <div className="basis-full rounded-2xl bg-secondary-container p-space-sm text-on-secondary-container" role="group" aria-label={`Quà từ ${pet.name}`}>
          <p className="text-label-md font-bold">{pet.name} mang quà về từ bài bạn vừa nghe!</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3">
            <span lang="zh" className="font-serif text-hanzi-display">{gift.term}</span>
            {gift.pinyin && <span className="text-pinyin-reading">{gift.pinyin}</span>}
            <span className="text-body-md">{gift.meaning}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <button type="button" onClick={() => { sfx.petBlip(); void playChinese(gift.term); }} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">Nghe</button>
            <Link href={`/learn/${gift.videoId}`} className="inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-bold underline">Về bài hát</Link>
            <button type="button" onClick={() => { sfx.petCheer(); take(); }} className="min-h-11 rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-bold">Nhận quà</button>
          </div>
        </div>
      )}
      {chatting && <PetChat name={pet.name} onClose={() => { sfx.petBlip(); setChatting(false); }} />}
      {echoing && echoWord && <PetEcho name={pet.name} word={echoWord} onReact={(tier: EchoTier) => fx(tier === "great" ? "cheer" : tier === "good" ? "tap" : "try")} onClose={() => { sfx.petBlip(); setEchoing(false); }} />}
      {feeding && <PetFeed name={pet.name} onEat={() => { setChewKey((k) => k + 1); fx("crunch"); }} onFull={() => fx("full")} onClose={() => { sfx.petBlip(); setFeeding(false); }} />}
    </section>
  );
}

/** Màn nhận nuôi: chọn loài, đặt tên, lưu một lần. `ready` = đã biết tổng XP hiện tại (cần để tính XP lúc nhận nuôi), nên nút chờ tới lúc đó. */
function AdoptPet({ onAdopt, ready }: { onAdopt: (species: PetSpecies, name: string) => void; ready: boolean }) {
  const [species, setSpecies] = useState<PetSpecies>(PET_SPECIES_READY[0]);
  const [name, setName] = useState("");
  const clean = cleanPetName(name);
  return (
    <section aria-labelledby="adopt-heading" className="card-ink flex flex-wrap items-center gap-x-space-md gap-y-space-sm p-space-md">
      <PetSprite species={species} stage={1} mood="happy" className="size-28 shrink-0" />
      <form className="min-w-[14rem] flex-1" onSubmit={(e) => { e.preventDefault(); if (clean && ready) onAdopt(species, clean); }}>
        <h2 id="adopt-heading" className="text-headline-md">Nhận nuôi một người bạn học</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">Bạn học càng đều, bạn nhỏ càng lớn nhanh. {PET_SPECIES_LABELS[species]} sẽ lớn thêm sau mỗi buổi học.</p>
        {PET_SPECIES_READY.length > 1 && (
          <div role="radiogroup" aria-label="Chọn loài" className="mt-2 flex flex-wrap gap-2">
            {PET_SPECIES_READY.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={s === species} onClick={() => { setSpecies(s); sfx.petChirp(s); }} className={`min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-bold ${s === species ? "bg-primary-container" : "bg-surface-container-low"}`}>{PET_SPECIES_LABELS[s]}</button>
            ))}
          </div>
        )}
        <div className="mt-space-sm flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="pet-name">Tên bạn nhỏ</label>
          <input id="pet-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={PET_NAME_MAX * 2} placeholder="Đặt tên, ví dụ Tiểu Long" autoComplete="off" className="min-h-11 min-w-[12rem] flex-1 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-md" />
          <Button3d type="submit" variant="bright" disabled={!clean || !ready}>Nhận nuôi</Button3d>
        </div>
      </form>
    </section>
  );
}

/** Hình pet có thể chạm: là `<button>` thật (vùng bấm lớn), có nhãn cho trình đọc màn hình; bóng thoại đọc to bằng aria-live; có công tắc tiếng. */
const NO_WORDS: PetReviewWord[] = [];
const BUBBLE = "rounded-2xl border-2 border-ink bg-surface-container-lowest px-3 py-1 text-label-md font-bold shadow-[0_2px_0_var(--shadow-ink)]";

function PetTouch({ pet, stage, mood, accessories, words, snapshot, chewKey, extra }: { pet: Pet; stage: PetStage; mood: PetMood; accessories: string[]; words: PetReviewWord[]; snapshot: PetSnapshot | null; chewKey: number; extra: PetBurst | null }) {
  const { tapKey, bubble, burst, tap } = usePetTalk(mood, pet.name, words, snapshot);
  return (
    <div className="relative shrink-0">
      <button type="button" onClick={tap} aria-label={`Chạm vào ${pet.name}`} className="block rounded-full">
        <PetSprite species={pet.species} stage={stage} mood={mood} accessories={accessories} tapKey={tapKey} chewKey={chewKey} className="size-28" />
      </button>
      <PetBurstFx burst={burst} species={pet.species} />
      <PetBurstFx burst={extra} species={pet.species} />
      <SoundToggle className="absolute -bottom-1 -right-2 flex size-11 items-center justify-center rounded-full text-lg hover:bg-surface-container" />
      <div aria-live="polite" className={bubble ? "absolute -top-4 left-2 z-10 w-max max-w-[11rem]" : "sr-only"}>
        {bubble?.kind === "line" && <p className={BUBBLE}>{bubble.text}</p>}
        {bubble?.kind === "word" && (
          <button type="button" onClick={() => void playChinese(bubble.word.term)} aria-label={reviewWordLabel(bubble.word)} className={`${BUBBLE} min-h-11 text-left`}>
            <span lang="zh" className="font-serif text-lg">{bubble.word.term}</span>
            {bubble.word.pinyin && <span className="ml-1 text-primary">{bubble.word.pinyin}</span>}
            <span className="block font-medium">{bubble.word.meaning}</span>
          </button>
        )}
      </div>
    </div>
  );
}
