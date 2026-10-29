"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PetBurst, PetBurstKind } from "@/lib/pet/pet-burst";
import type { PetMood } from "@/lib/pet/pet-logic";
import { petReactionFor, petReactionLine, type PetReaction, type PetSnapshot } from "@/lib/pet/pet-reaction";
import { pickReviewWord, type PetReviewWord } from "@/lib/pet/pet-review-word";
import { pickPetLine, spendSpeech, type PetSpeechBudget } from "@/lib/pet/pet-speech";

const BUDGET_KEY = "lyric-lab-pet-speech";
const BUBBLE_MS = 4500;
/** Bóng thoại mang từ cần bấm để nghe nên ở lâu hơn. */
const WORD_BUBBLE_MS = 8000;
const REACTION_BURST: Record<PetReaction, PetBurstKind> = { levelUp: "cheer", streakUp: "cheer", goalDone: "goal", streakLost: "sad" };
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

/**
 * Pet nói và nảy. (1) Chạm: nảy (tăng `tapKey`), kêu (tiếng riêng từng loài, phát bởi `PetBurstFx`), hiện một câu hoặc một từ cần ôn (tối đa vài lần mỗi ngày, quá thì chỉ nảy và kêu).
 * (2) Sự kiện: khi `snapshot` đổi (lên cấp, tăng chuỗi, đạt mục tiêu, mất chuỗi) pet nảy, bắn hạt kèm tiếng riêng (`burst`) và nói một câu;
 * không tính vào hạn mức chạm vì sự kiện hiếm và là phản hồi cho việc người dùng vừa làm.
 */
export function usePetTalk(mood: PetMood, name: string, words: readonly PetReviewWord[] = [], snapshot: PetSnapshot | null = null) {
  const [tapKey, setTapKey] = useState(0);
  const [bubble, setBubble] = useState<PetBubble | null>(null);
  const [burst, setBurst] = useState<PetBurst | null>(null);
  const [prevSnapshot, setPrevSnapshot] = useState(snapshot);
  const taps = useRef(0);

  // Điều chỉnh state ngay lúc vẽ khi ảnh chụp đổi (React cho phép; lint cấm setState trực tiếp trong effect).
  if (snapshot !== prevSnapshot && (snapshot?.level !== prevSnapshot?.level || snapshot?.streak !== prevSnapshot?.streak || snapshot?.mood !== prevSnapshot?.mood)) {
    const reaction = petReactionFor(prevSnapshot, snapshot);
    setPrevSnapshot(snapshot);
    if (reaction) {
      setTapKey((k) => k + 1);
      setBurst((b) => ({ key: (b?.key ?? 0) + 1, kind: REACTION_BURST[reaction] }));
      setBubble({ kind: "line", text: petReactionLine(reaction, name) });
    }
  }

  // Tự ẩn bóng thoại sau một lúc.
  useEffect(() => {
    if (!bubble) return;
    const id = setTimeout(() => setBubble(null), bubble.kind === "word" ? WORD_BUBBLE_MS : BUBBLE_MS);
    return () => clearTimeout(id);
  }, [bubble]);

  const tap = useCallback(() => {
    setTapKey((k) => k + 1);
    setBurst((b) => ({ key: (b?.key ?? 0) + 1, kind: mood === "sleepy" ? "tapSleepy" : "tap" }));
    const { allowed, next } = spendSpeech(readBudget(), todayKey());
    taps.current += 1;
    if (!allowed) return;
    try { localStorage.setItem(BUDGET_KEY, JSON.stringify(next)); } catch { /* không lưu được: hạn mức chỉ có tác dụng trong phiên */ }
    // Lần chạm lẻ (khi pet không ngủ) mang theo một từ đang cần ôn; lần chẵn nói câu động viên.
    const word = mood !== "sleepy" && next.count % 2 === 1 ? pickReviewWord(words, (next.count - 1) / 2) : null;
    setBubble(word ? { kind: "word", word } : { kind: "line", text: pickPetLine(mood, name, next.count - 1) });
  }, [mood, name, words]);

  return { tapKey, bubble, burst, tap };
}
