"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMatchRound, type MatchCard } from "@/lib/practice/match-round";
import { pickPracticeCards } from "@/lib/practice/pick-practice-cards";
import type { ReviewCard } from "@/lib/user-data/review-repo";

const PAIRS = 6;
const BEST_KEY = "lyric-lab-match-best";

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

function readBest(): number | null {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

/**
 * Ghép cặp: nối chữ Hán với nghĩa, 6 cặp mỗi vòng, có đồng hồ đếm lên và kỷ lục cá nhân. Chỉ là luyện thêm nên
 * không thay đổi lịch ôn. Chọn một ô ở cột trái rồi một ô ở cột phải (thứ tự nào cũng được).
 */
export function MatchGame({ cards }: { cards: ReviewCard[] }) {
  const [roundNo, setRoundNo] = useState(0);
  const round = useMemo(() => buildMatchRound(pickPracticeCards(cards, 30, new Date()) as MatchCard[], PAIRS), [cards, roundNo]); // eslint-disable-line react-hooks/exhaustive-deps
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [seconds, setSeconds] = useState(0);
  // Component chỉ được vẽ sau khi thẻ đã tải xong ở client nên đọc localStorage lúc khởi tạo là an toàn (không lệch hydrate).
  const [best, setBest] = useState<number | null>(readBest);
  const [newRecord, setNewRecord] = useState(false);
  const total = round.lefts.length;
  const done = total > 0 && matched.size === total;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done, roundNo]);
  /** Kết thúc vòng: cập nhật kỷ lục cá nhân nếu nhanh hơn. Gọi từ thao tác của người dùng, không phải từ effect. */
  function finishRound(elapsed: number) {
    const previous = readBest();
    if (previous !== null && elapsed >= previous) return;
    try { localStorage.setItem(BEST_KEY, String(elapsed)); } catch { /* không lưu được: bỏ qua */ }
    setNewRecord(true);
    setBest(elapsed);
  }

  function attempt(l: string, r: string) {
    if (l === r) {
      const next = new Set(matched).add(l);
      setMatched(next);
      if (next.size === total) finishRound(seconds);
    } else {
      setMistakes((n) => n + 1);
      setWrongPair([l, r]);
      setTimeout(() => setWrongPair(null), 700);
    }
    setLeft(null);
    setRight(null);
  }

  function pickLeft(id: string) {
    if (matched.has(id)) return;
    if (right) attempt(id, right);
    else setLeft(left === id ? null : id);
  }
  function pickRight(id: string) {
    if (matched.has(id)) return;
    if (left) attempt(left, id);
    else setRight(right === id ? null : id);
  }

  function again() {
    setRoundNo((n) => n + 1);
    setMatched(new Set()); setMistakes(0); setSeconds(0); setLeft(null); setRight(null); setNewRecord(false);
  }

  const cell = (id: string, selected: boolean, wrong: boolean) =>
    `flex min-h-14 w-full items-center justify-center rounded-2xl px-3 py-2 text-center transition-colors ${matched.has(id) ? "bg-secondary-container/60 text-on-secondary-container opacity-70" : wrong ? "bg-error-container/60 text-on-error-container anim-note-shake" : selected ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-md text-on-surface-variant">
        <p>Đã ghép <strong className="text-on-surface">{matched.size}</strong> / {total} · Nhầm <strong className="text-on-surface">{mistakes}</strong></p>
        <p>Thời gian <strong className="font-mono text-primary">{fmt(seconds)}</strong>{best !== null && <> · Kỷ lục <strong className="font-mono">{fmt(best)}</strong></>}</p>
      </div>

      <div className="mt-space-sm grid grid-cols-2 gap-space-md">
        <ul aria-label="Chữ Hán" className="space-y-space-sm">
          {round.lefts.map((l) => (
            <li key={l.id}>
              <button type="button" disabled={matched.has(l.id)} aria-pressed={left === l.id} onClick={() => pickLeft(l.id)} className={cell(l.id, left === l.id, wrongPair?.[0] === l.id)}>
                <span><span lang="zh" className="font-serif text-headline-md">{l.text}</span>{l.sub && <span className="block text-label-sm opacity-80">{l.sub}</span>}</span>
                {matched.has(l.id) && <span className="sr-only"> (đã ghép)</span>}
              </button>
            </li>
          ))}
        </ul>
        <ul aria-label="Nghĩa" className="space-y-space-sm">
          {round.rights.map((r) => (
            <li key={r.id}>
              <button type="button" disabled={matched.has(r.id)} aria-pressed={right === r.id} onClick={() => pickRight(r.id)} className={cell(r.id, right === r.id, wrongPair?.[1] === r.id)}>
                <span className="text-body-md font-medium">{r.text}</span>
                {matched.has(r.id) && <span className="sr-only"> (đã ghép)</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {done && (
        <div role="status" className="mt-space-lg rounded-3xl bg-surface-container-lowest p-space-lg text-center shadow-[0_1px_10px_rgba(30,26,22,0.08)]">
          <h2 className="font-serif text-headline-md">Ghép xong trong {fmt(seconds)}{mistakes === 0 ? ", không nhầm lần nào!" : `, nhầm ${mistakes} lần.`}</h2>
          {newRecord && <p className="mt-1 text-body-md font-semibold text-secondary">Kỷ lục mới!</p>}
          <button type="button" onClick={again} className="mt-space-md min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">Vòng tiếp theo</button>
        </div>
      )}
    </div>
  );
}
