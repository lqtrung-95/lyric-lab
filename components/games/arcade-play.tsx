"use client";

import type { GameWord } from "@/lib/games/game-word";
import { arcadeGate } from "./arcade-state";
import { BlasterGame } from "./blaster-game";
import { PetDuelGame } from "@/components/pet/pet-duel-game";
import { RainGame } from "./rain-game";
import { useGameWords } from "./use-game-words";
import { TowerGame } from "./tower-game";
import { WhackGame } from "./whack-game";

const MIN_WORDS = 8;

/** Nạp từ chơi (từ đã lưu của người dùng, bổ sung từ kho chung) rồi vào game; gom các game cần danh sách từ về một chỗ để trang chỉ là thành phần máy chủ mỏng. */
export function ArcadePlay({ kind, bank }: { kind: "blaster" | "rain" | "whack" | "petduel" | "tower"; bank: GameWord[] }) {
  const { status, words, fromCards } = useGameWords(bank, MIN_WORDS);
  const gate = arcadeGate(status, words.length >= MIN_WORDS, "Chưa tải được kho từ. Thử tải lại trang nhé.");
  if (gate) return gate;
  return (
    <>
      <p className="mb-space-sm text-body-sm text-on-surface-variant">{fromCards > 0 ? `Đang chơi với ${fromCards} từ bạn đã lưu${words.length > fromCards ? " và từ HSK bổ sung" : ""}.` : "Bạn chưa lưu từ nào nên đang chơi với từ HSK 2–4. Lưu từ khi xem trước bài hát để chơi với từ của riêng bạn."}</p>
      {kind === "blaster" ? <BlasterGame words={words} /> : kind === "rain" ? <RainGame words={words} /> : kind === "petduel" ? <PetDuelGame words={words} /> : kind === "tower" ? <TowerGame words={words} /> : <WhackGame words={words} />}
    </>
  );
}
