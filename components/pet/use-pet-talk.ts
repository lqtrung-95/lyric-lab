"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/games/arcade-sfx";
import type { PetMood } from "@/lib/pet/pet-logic";
import { pickReviewWord, type PetReviewWord } from "@/lib/pet/pet-review-word";
import { pickPetLine, spendSpeech, type PetSpeechBudget } from "@/lib/pet/pet-speech";

const BUDGET_KEY = "lyric-lab-pet-speech";
const BUBBLE_MS = 4500;
/** Bóng thoại mang từ cần bấm để nghe nên ở lâu hơn. */
const WORD_BUBBLE_MS = 8000;
const todayKey = () => new Date().toLocaleDateString("sv");

function readBudget(): PetSpeechBudget | null {
  try {
    const b = JSON.parse(localStorage.getItem(BUDGET_KEY) ?? "null") as Partial<PetSpeechBudget> | null;
    return b && typeof b.day === "string" && typeof b.count === "number" ? { day: b.day, count: b.count } : null;
  } catch {
    return null;
  }
}

export type PetBubble = { kind: "line"; text: string } | { kind: "word"; word: PetReviewWord };

/** Chạm vào pet: nảy (tăng `tapKey`), kêu `pop`, và hiện một câu nói ngắn (tối đa vài lần mỗi ngày, quá thì chỉ nảy và kêu). */
export function usePetTalk(mood: PetMood, name: string, words: readonly PetReviewWord[] = []) {
  const [tapKey, setTapKey] = useState(0);
  const [bubble, setBubble] = useState<PetBubble | null>(null);
  const taps = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const tap = useCallback(() => {
    setTapKey((k) => k + 1);
    sfx.pop(taps.current % 4);
    const { allowed, next } = spendSpeech(readBudget(), todayKey());
    taps.current += 1;
    if (!allowed) return;
    try { localStorage.setItem(BUDGET_KEY, JSON.stringify(next)); } catch { /* không lưu được: hạn mức chỉ có tác dụng trong phiên */ }
    // Lần chạm lẻ (khi pet không ngủ) mang theo một từ đang cần ôn; lần chẵn nói câu động viên.
    const word = mood !== "sleepy" && next.count % 2 === 1 ? pickReviewWord(words, (next.count - 1) / 2) : null;
    setBubble(word ? { kind: "word", word } : { kind: "line", text: pickPetLine(mood, name, next.count - 1) });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(null), word ? WORD_BUBBLE_MS : BUBBLE_MS);
  }, [mood, name, words]);

  return { tapKey, bubble, tap };
}
