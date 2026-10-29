"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/games/arcade-sfx";
import type { PetMood } from "@/lib/pet/pet-logic";
import { pickPetLine, spendSpeech, type PetSpeechBudget } from "@/lib/pet/pet-speech";

const BUDGET_KEY = "lyric-lab-pet-speech";
const BUBBLE_MS = 4500;
const todayKey = () => new Date().toLocaleDateString("sv");

function readBudget(): PetSpeechBudget | null {
  try {
    const b = JSON.parse(localStorage.getItem(BUDGET_KEY) ?? "null") as Partial<PetSpeechBudget> | null;
    return b && typeof b.day === "string" && typeof b.count === "number" ? { day: b.day, count: b.count } : null;
  } catch {
    return null;
  }
}

/** Chạm vào pet: nảy (tăng `tapKey`), kêu `pop`, và hiện một câu nói ngắn (tối đa vài lần mỗi ngày, quá thì chỉ nảy và kêu). */
export function usePetTalk(mood: PetMood, name: string) {
  const [tapKey, setTapKey] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
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
    setBubble(pickPetLine(mood, name, next.count - 1));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
  }, [mood, name]);

  return { tapKey, bubble, tap };
}
