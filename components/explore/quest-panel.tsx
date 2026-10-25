"use client";

import { useEffect } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { playChinese } from "@/lib/speech/play-chinese";
import { roundNeedsDelivery, type QuestRound } from "@/lib/explore/build-explore-quests";
import { commandMeaning, commandText } from "@/lib/explore/quest-commands";
import type { SceneWord } from "@/lib/explore/explore-types";
import type { QuestPhase } from "./use-quest-run";

interface Props {
  rounds: QuestRound[];
  index: number;
  phase: QuestPhase;
  wrong: number;
  words: Record<string, SceneWord>;
  /** Vật nhân vật đang cầm (câu "mang đồ"). */
  carrying: string | null;
  /** Tên NPC giao nhiệm vụ của cảnh (Cú Thầy, Bếp trưởng Gấu...). */
  npcName: string;
  onQuit: () => void;
}

/** Lời của Gấu Trúc cho câu hiện tại. Câu "nghe" tự phát giọng đọc khi vào câu (sau thao tác bấm của người học nên trình duyệt cho phát). */
export function QuestPanel({ rounds, index, phase, wrong, words, carrying, npcName, onQuit }: Props) {
  const round = rounds[index];
  const word = round ? words[round.targetId] : null;
  const portable = word?.portable === true;
  useEffect(() => {
    if (!round || !word || phase !== "asking" || wrong !== 0) return;
    if (round.kind === "listen") void playChinese(word.term);
    else if (round.kind === "command") void playChinese(commandText(word.term, portable));
  }, [round, word, portable, phase, wrong]);
  if (!round || !word) return null;
  const delivery = roundNeedsDelivery(round.kind, portable);

  return (
    <section aria-label="Nhiệm vụ của Gấu Trúc" className="card-ink p-space-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-label-md font-extrabold text-on-surface-variant">Câu {index + 1}/{rounds.length}</p>
        <button type="button" onClick={onQuit} className="min-h-11 px-2 text-label-md font-bold text-primary hover:underline">Dừng</button>
      </div>
      <ProgressBar size="sm" value={index + (phase === "asking" ? 0 : 1)} max={rounds.length} label="Tiến độ nhiệm vụ" tone="primary" />
      <div className="mt-space-sm min-h-24" aria-live="polite">
        {phase === "asking" && round.kind === "listen" && (
          <div className="flex items-center gap-3">
            <PronounceButton text={word.term} className="size-14" />
            <p className="text-body-lg font-bold">Nghe và đi tới vật bạn nghe thấy.</p>
          </div>
        )}
        {phase === "asking" && round.kind === "command" && (
          <div className="flex items-center gap-3">
            <PronounceButton text={commandText(word.term, portable)} className="size-14" />
            <p className="text-body-lg font-bold">{npcName} ra lệnh bằng tiếng Trung (không có phụ đề). Nghe và làm theo!</p>
          </div>
        )}
        {phase === "asking" && round.kind === "bring" && <p className="text-body-lg font-bold">Mang cho {npcName}: <span className="text-headline-md text-primary">{word.gloss}</span></p>}
        {phase === "asking" && round.kind === "meaning" && <p className="text-body-lg font-bold">Đi tới: <span className="text-headline-md text-primary">{word.gloss}</span></p>}
        {phase === "asking" && round.kind === "hanzi" && (
          <div className="flex items-center gap-3">
            <p lang="zh-Hans" className="text-5xl font-extrabold">{word.term}</p>
            <p className="text-body-lg font-bold">Đi tới vật có tên này.</p>
          </div>
        )}
        {phase === "asking" && (
          <p className="mt-1 text-label-md text-on-surface-variant">
            {carrying ? `Bạn đang cầm vật rồi. Mang tới ${npcName} và nhấn E (hoặc chạm vào ${npcName}) để giao.`
              : delivery ? `Lại gần đúng vật, nhấn E (hoặc chạm vào vật) để nhặt, rồi mang tới ${npcName}.`
              : "Lại gần vật rồi nhấn E (hoặc chạm vào vật) để chọn."}
          </p>
        )}
        {phase === "asking" && wrong > 0 && <p role="status" className="mt-1 text-label-md font-bold text-error">Chưa đúng, thử lại nhé (còn 1 lần).</p>}
        {phase === "correct" && (
          <p role="status" className="flex items-center gap-2 text-body-lg font-extrabold text-secondary"><Icon name="check_circle" size={26} filled />Đúng rồi! <span lang="zh-Hans">{word.term}</span> ({word.pinyin}) là {word.gloss}.</p>
        )}
        {(phase === "correct" || phase === "reveal") && round.kind === "command" && (
          <p className="mt-1 text-body-md text-on-surface-variant">{npcName} nói: <span lang="zh-Hans" className="font-bold text-on-surface">{commandText(word.term, portable)}</span> {commandMeaning(word.gloss, portable)}</p>
        )}
        {phase === "reveal" && (
          <p role="status" className="text-body-lg font-bold">Đáp án là <b lang="zh-Hans" className="text-primary">{word.term}</b> ({word.pinyin}): {word.gloss}. Mình sẽ gặp lại từ này sau.</p>
        )}
      </div>
    </section>
  );
}

interface SummaryProps { results: { id: string; firstTry: boolean }[]; words: Record<string, SceneWord>; /** XP ước tính của lượt (còn tùy trần XP luyện tập mỗi ngày). */ xp: number; onAgain: () => void; onBack: () => void }

/** Tổng kết lượt: số câu đúng ngay lần đầu và các từ cần gặp lại. */
export function QuestSummary({ results, words, xp, onAgain, onBack }: SummaryProps) {
  const good = results.filter((r) => r.firstTry).length;
  const weak = results.filter((r) => !r.firstTry).map((r) => words[r.id]).filter(Boolean);
  return (
    <section aria-label="Kết quả nhiệm vụ" className="card-ink p-space-md">
      <p className="text-headline-md">Hoàn thành! Đúng ngay lần đầu {good}/{results.length}</p>
      {xp > 0 && <p className="text-body-md font-bold text-secondary">+{xp} XP (tính vào cấp và nhiệm vụ ngày của bạn)</p>}
      {weak.length > 0 ? (
        <>
          <p className="mt-1 text-body-md text-on-surface-variant">Từ cần gặp lại:</p>
          <ul className="mt-1 flex flex-wrap gap-2">{weak.map((w) => <li key={w.id} lang="zh-Hans" className="rounded-full border-2 border-ink bg-surface-container-low px-3 py-1 text-label-md font-extrabold">{w.term} <span className="font-normal">{w.gloss}</span></li>)}</ul>
        </>
      ) : <p className="mt-1 text-body-md text-secondary font-bold">Tuyệt vời, không sai từ nào!</p>}
      <div className="mt-space-sm flex flex-wrap gap-2">
        <Button3d onClick={onAgain}>Chơi lại</Button3d>
        <Button3d variant="neutral" onClick={onBack}>Về khám phá</Button3d>
      </div>
    </section>
  );
}
