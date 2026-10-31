"use client";

import Link from "next/link";
import { useRadicalProgress } from "@/components/radicals/use-radical-progress";
import { radicalOfDay } from "@/lib/radicals/radicals";
import { useGrammarStats } from "@/components/grammar/use-grammar-stats";
import { grammarById } from "@/lib/grammar/grammar-patterns";
import { weakPatternIds } from "@/lib/grammar/grammar-stats";
import { useState } from "react";
import { useGameSummary } from "@/components/layout/use-game-summary";
import { useStreak } from "@/components/streak/use-streak";
import { SoundToggle } from "@/components/games/sound-toggle";
import { Button3d } from "@/components/ui/button-3d";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PET_SPECIES_LABELS, cleanPetName, daysSinceStudy, petGrowth, petMood, unlockedAccessories, type Pet, type PetMood, type PetSpecies, type PetStage } from "@/lib/pet/pet-logic";
import { dailyGoalProgress } from "@/lib/streak/daily-goal";
import { PetSprite } from "./pet-sprite";
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
import { PetEdit } from "./pet-edit";
import { AdoptPet } from "./pet-adopt";
import { AwayPlaceholder, PetAdventure, usePetAdventure } from "./pet-adventure";
import { PetShareCard } from "./pet-share-card";
import { PetTeach, forgottenCount, usePetTaught } from "./pet-teach";
import { useNow } from "./use-now";
import { adventurePhase, canStartAdventure } from "@/lib/pet/pet-adventure";
import { daysTogether } from "@/lib/pet/pet-share";
import { PetFeed } from "./pet-feed";
import { PetHome } from "./pet-home";
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
  // Bản nháp khi đang đổi tên/loài: thẻ hiển thị ngay theo bản nháp để xem trước, chỉ lưu khi bấm Lưu.
  const [draft, setDraft] = useState<{ species: PetSpecies; name: string } | null>(null);
  const editing = draft !== null;
  const echoWord = review?.peek[0] ?? null;
  const { gift, take } = usePetGift();
  const [chewKey, setChewKey] = useState(0);
  const [teaching, setTeaching] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [homing, setHoming] = useState(false);
  const now = useNow();
  const { adventure, setAdventure } = usePetAdventure();
  const { taught } = usePetTaught();
  const { stats: grammarStats } = useGrammarStats();
  const { progress: radicalProgress } = useRadicalProgress();
  const [seenBack, setSeenBack] = useState<string | null>(null);
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
  // Pet đi phiêu lưu về mang quà: nổ hiệu ứng quà một lần cho mỗi chuyến.
  const phase = adventure && now ? adventurePhase(adventure, now) : null;
  if (phase === "back" && adventure && seenBack !== adventure.day) { setSeenBack(adventure.day); fx("gift"); }
  if (pet === null && !wasEmpty) setWasEmpty(true);
  if (pet && wasEmpty && !adoptFxDone) { setAdoptFxDone(true); fx("adopt"); }
  if (evolved && evolved !== seenEvolved) { setSeenEvolved(evolved); fx("evolve"); }
  if (pet === undefined) return null;
  if (pet === null) return <AdoptPet ready={game !== undefined} onAdopt={(species, name) => adopt({ species, name, adoptedAt: new Date().toISOString(), baseXp: game?.xp.total ?? 0 })} />;

  const goal = dailyGoalProgress(streak?.todayItems ?? 0, streak?.dailyGoal ?? 0);
  const goalDone = goal.done || (!goal.enabled && (streak?.todayItems ?? 0) > 0);
  const today = now ? (streak?.week.find((d) => d.isToday)?.day ?? null) : null;
  const away = phase === "away";
  const forgot = forgottenCount(taught, now);
  const dayRadical = now ? radicalOfDay(Math.floor(now / 86_400_000), radicalProgress.known) : null;
  const weakGrammar = grammarById(weakPatternIds(grammarStats, 1)[0] ?? "") ?? null;
  const mood = streak ? petMood(goal, daysSinceStudy(streak)) : "hungry";
  const shown: Pet = draft ? { ...pet, species: draft.species, name: cleanPetName(draft.name) ?? pet.name } : pet;
  const previewing = draft !== null && (shown.species !== pet.species || shown.name !== pet.name);
  const nextStage = (STAGE_NAMES[growth.stage] ?? "").toLowerCase();
  const accessories = unlockedAccessories(streak?.longest ?? 0);
  // Dữ liệu game/chuỗi chưa tải xong thì chưa có ảnh chụp (không phản ứng với số tạm thời).
  // Không cần useMemo: `usePetTalk` so từng trường chứ không so địa chỉ đối tượng.
  const homeBase = { streakLongest: streak?.longest ?? 0, level: game?.level.n ?? 1, daysTogether: daysTogether(pet.adoptedAt, now), daysStudied: streak?.weekCount ?? 0 };
  const snapshot: PetSnapshot | null = game && streak ? { level: game.level.n, streak: game.streak.current, mood } : null;
  return (
    <section aria-labelledby="pet-heading" className="pet-ui card-ink flex flex-wrap items-center gap-x-space-md gap-y-space-sm p-space-md">
      {away && adventure ? <AwayPlaceholder title={adventure.title} /> : <PetTouch pet={shown} stage={growth.stage} mood={mood} accessories={accessories.map((a) => a.id)} words={review?.peek ?? NO_WORDS} snapshot={snapshot} chewKey={chewKey} extra={extra} />}
      <div className="min-w-[14rem] flex-1">
        <h2 id="pet-heading" className="text-headline-md">{shown.name} <span className="text-label-md font-bold text-on-surface-variant">· {PET_SPECIES_LABELS[shown.species]} · {(STAGE_NAMES[growth.stage - 1] ?? "").toLowerCase()}</span></h2>
        {evolved && <p role="status" className="mt-1 inline-block rounded-full bg-primary-container px-3 py-0.5 text-label-md font-extrabold">Tiến hóa! {pet.name} đã lên giai đoạn {(STAGE_NAMES[evolved - 1] ?? "").toLowerCase()}</p>}
        <p role="status" className="mt-1 text-body-md">{MOOD_TEXT[mood](shown.name)}</p>
        {previewing && <p className="mt-1 inline-block rounded-full border-2 border-dashed border-ink px-3 py-0.5 text-label-md font-bold">Xem trước, chưa lưu</p>}
        {growth.maxed ? (
          <p className="mt-2 text-label-md font-bold text-secondary">{pet.name} đã trưởng thành!</p>
        ) : (
          <div className="mt-2">
            <ProgressBar size="sm" value={growth.progressXp} max={growth.nextXp} label={`Tiến độ lên giai đoạn ${nextStage}`} />
            <p className="mt-1 text-label-md text-on-surface-variant">Còn {growth.nextXp - growth.progressXp} XP nữa là lên giai đoạn {nextStage}</p>
          </div>
        )}
        {accessories.length > 0 && <p className="mt-1 text-label-md text-on-surface-variant">Phụ kiện đã mở: {accessories.map((a) => a.label).join(", ")}</p>}
        {weakGrammar && !teaching && <p role="status" className="mt-1 text-label-md font-bold text-secondary">{pet.name} thấy bạn hay sai mẫu “{weakGrammar.title}”. <Link href={`/grammar/${weakGrammar.id}`} className="inline-flex min-h-11 items-center underline">Ôn lại nhé</Link></p>}
        {dayRadical && !weakGrammar && !teaching && <p className="mt-1 text-label-md text-on-surface-variant">Bộ thủ hôm nay: <Link href={`/radicals/${dayRadical.num}`} className="inline-flex min-h-11 items-center font-bold text-secondary underline"><span lang="zh-Hans" className="mr-1 font-serif text-lg">{dayRadical.char}</span>Bộ {dayRadical.name} ({dayRadical.meaning})</Link></p>}
        {forgot > 0 && !teaching && <p role="status" className="mt-1 text-label-md font-bold text-secondary">{pet.name} đang quên {forgot} từ bạn đã dạy. Dạy lại nhé!</p>}
        {!feeding && !echoing && !chatting && !editing && !teaching && !homing && !away && (
          <div className="mt-space-sm flex flex-wrap gap-2">
            {(review?.total ?? 0) > 0 && <Button3d type="button" variant="bright" onClick={() => { sfx.petBlip(); setFeeding(true); }}>Cho {pet.name} ăn thẻ</Button3d>}
            <Button3d type="button" onClick={() => { sfx.petBlip(); fx("tap"); setChatting(true); }}>Nói chuyện với {pet.name}</Button3d>
            <Button3d type="button" onClick={() => { sfx.petBlip(); setTeaching(true); }}>Dạy {pet.name}</Button3d>
            {echoWord && <Button3d type="button" onClick={() => { sfx.petBlip(); setEchoing(true); }}>Tập nói cùng {pet.name}</Button3d>}
            <Button3d type="button" onClick={() => { sfx.petBlip(); setHoming(true); }}>Nhà của {pet.name}</Button3d>
            <Button3d type="button" variant="tertiary" onClick={() => { sfx.petBlip(); setSharing(true); }}>Khoe {pet.name}</Button3d>
            <button type="button" onClick={() => { sfx.petBlip(); setDraft({ species: pet.species, name: pet.name }); }} className="min-h-11 rounded-full px-3 text-label-md font-bold text-on-surface-variant underline">Đổi tên / đổi bạn nhỏ</button>
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
      <PetAdventure name={pet.name} species={pet.species} adventure={adventure} now={now} today={today} canGo={canStartAdventure(goalDone, adventure, today ?? "")} onChange={setAdventure} onFx={fx} />
      {homing && <PetHome pet={shown} stage={growth.stage} mood={mood} accessories={accessories.map((a) => a.id)} base={homeBase} onFx={fx} onClose={() => { sfx.petBlip(); setHoming(false); }} />}
      {teaching && <PetTeach name={pet.name} onReact={fx} onClose={() => { sfx.petBlip(); setTeaching(false); }} />}
      {sharing && <PetShareCard pet={pet} stage={growth.stage} accessories={accessories.map((a) => a.id)} stats={{ level: game?.level.n ?? 1, streak: game?.streak.current ?? 0, xpSince: Math.max(0, (game?.xp.total ?? 0) - pet.baseXp), daysTogether: daysTogether(pet.adoptedAt, now), taughtWords: taught.length }} onClose={() => setSharing(false)} />}
      {draft && <PetEdit pet={pet} draft={draft} onDraft={setDraft} onSave={(next) => { adopt(next); sfx.petAdopt(); fx("adopt"); setDraft(null); }} onClose={() => { sfx.petBlip(); setDraft(null); }} />}
      {chatting && <PetChat name={pet.name} onClose={() => { sfx.petBlip(); setChatting(false); }} />}
      {echoing && echoWord && <PetEcho name={pet.name} word={echoWord} onReact={(tier: EchoTier) => fx(tier === "great" ? "cheer" : tier === "good" ? "tap" : "try")} onClose={() => { sfx.petBlip(); setEchoing(false); }} />}
      {feeding && <PetFeed name={pet.name} onEat={() => { setChewKey((k) => k + 1); fx("crunch"); }} onFull={() => fx("full")} onClose={() => { sfx.petBlip(); setFeeding(false); }} />}
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
      <button type="button" onClick={tap} aria-label={`Chạm vào ${pet.name}`} className="cursor-pointer block rounded-full">
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
