"use client";

import { useEffect, useState } from "react";
import { playSfx } from "@/lib/feedback/sfx";
import { evolvedStage, type PetStage } from "@/lib/pet/pet-logic";

const SEEN_KEY = "lyric-lab-pet-stage";

function readSeen(): number | null {
  try {
    const raw = Number(localStorage.getItem(SEEN_KEY));
    return Number.isInteger(raw) && raw >= 1 ? raw : null;
  } catch {
    return null; // localStorage bị chặn: coi như lần đầu.
  }
}

/**
 * Giai đoạn vừa tiến hóa (hoặc null). Nhớ giai đoạn đã thấy ở localStorage: lên giai đoạn mới thì phát tiếng `levelup` và trả giai đoạn đó
 * một lần (tải lại trang thì không báo nữa). Lần đầu chỉ ghi lại, không báo, để pet vừa nhận nuôi không "tiến hóa" ngay.
 * `ready` = đã có XP thật (chưa có thì giai đoạn 1 tạm thời, không được ghi nhận).
 */
export function usePetEvolution(stage: PetStage, ready: boolean): PetStage | null {
  const [handled, setHandled] = useState<PetStage | null>(null);
  const [evolved, setEvolved] = useState<PetStage | null>(null);
  // Điều chỉnh state ngay trong lúc vẽ khi giai đoạn đổi (React cho phép, không cần effect + setState).
  if (ready && handled !== stage) {
    setHandled(stage);
    const next = evolvedStage(readSeen(), stage);
    if (next) setEvolved(next);
  }
  useEffect(() => {
    if (handled === null) return;
    try {
      const seen = readSeen();
      if (seen === null || handled > seen) localStorage.setItem(SEEN_KEY, String(handled));
    } catch {
      // Không lưu được thì lần sau có thể báo lại; chấp nhận.
    }
  }, [handled]);
  useEffect(() => {
    if (evolved) playSfx("levelup");
  }, [evolved]);
  return evolved;
}
