"use client";

import { useMemo } from "react";
import { usePracticePool, type PoolStatus } from "@/components/practice/use-practice-pool";
import { shortMeaning } from "@/lib/practice/match-round";
import type { GameWord } from "@/lib/games/game-word";

/**
 * Từ để chơi: ưu tiên từ vựng người dùng đã lưu (có pinyin); thiếu so với `min` thì bổ sung từ kho chung của máy chủ để ai cũng chơi được ngay.
 * `fromCards` cho biết bao nhiêu từ là của riêng người chơi.
 */
export function useGameWords(bank: GameWord[], min: number): { status: PoolStatus; words: GameWord[]; fromCards: number } {
  const { status, cards } = usePracticePool();
  return useMemo(() => {
    const own: GameWord[] = cards.filter((c) => c.kind === "vocab" && c.pinyin && c.term.length <= 6).map((c) => ({ han: c.term, pinyin: c.pinyin ?? "", meaning: shortMeaning(c.meaning) || undefined }));
    const seen = new Set(own.map((w) => w.han));
    const words = own.length >= min ? own : [...own, ...bank.filter((w) => !seen.has(w.han))];
    return { status, words, fromCards: Math.min(own.length, words.length) };
  }, [status, cards, bank, min]);
}
