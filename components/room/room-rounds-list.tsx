"use client";

import { Icon } from "@/components/ui/icon";
import { missedRoundCards, roundCardToSavedItem } from "@/lib/rooms/round-card";
import type { RoundSummary } from "@/lib/rooms/room-types";
import { itemKey } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

const seconds = (ms: number) => (ms / 1000).toFixed(1).replace(".", ",");

function Outcome({ who, answer }: { who: string; answer: { correct: boolean; points: number; elapsedMs: number } | null }) {
  return (
    <span className={`flex items-center gap-1 text-label-md ${who === "Bạn" ? "" : "text-on-surface-variant"}`}>
      <Icon name={answer?.correct ? "check_circle" : "close"} filled={!!answer?.correct} size={18} className={answer?.correct ? "text-secondary" : "text-error"} />
      <span className="sr-only">{who}: </span>{answer ? `${answer.correct ? `+${answer.points}` : "0"} · ${seconds(answer.elapsedMs)}s` : "bỏ trống"}
    </span>
  );
}

/**
 * "Từng câu" của một ván đã kết thúc: từ đúng, nghĩa dòng, kết quả của hai bên và nút lưu từ thành thẻ ôn (cùng kho thẻ với màn Nghe).
 * "Lưu các từ trả lời sai" lưu cả loạt những từ người xem sai hoặc bỏ trống mà chưa lưu.
 */
export function RoomRoundsList({ rounds }: { rounds: RoundSummary[] }) {
  const { state, toggleSaved } = useLearnerState();
  const savedKeys = new Set(state.saved.map((s) => s.key));
  const missed = missedRoundCards(rounds);
  const unsavedMissed = missed.filter((c) => !savedKeys.has(itemKey({ type: "vocab", term: c.term })));

  return (
    <section aria-labelledby="rounds-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="rounds-heading" className="font-serif text-headline-md text-on-surface">Từng câu</h2>
        {missed.length > 0 && (
          <button
            type="button" disabled={unsavedMissed.length === 0}
            onClick={() => { const now = Date.now(); unsavedMissed.forEach((c, i) => toggleSaved(roundCardToSavedItem(c, now + i))); }}
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-container-high px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest disabled:opacity-60"
          >
            <Icon name={unsavedMissed.length === 0 ? "check_circle" : "bookmark_add"} size={18} />
            {unsavedMissed.length === 0 ? "Đã lưu các từ sai" : `Lưu ${unsavedMissed.length} từ trả lời sai`}
          </button>
        )}
      </div>
      <ol className="mt-space-sm divide-y divide-outline-variant">
        {rounds.map((r) => {
          const saved = r.card ? savedKeys.has(itemKey({ type: "vocab", term: r.card.term })) : false;
          return (
            <li key={r.index} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
              <span className="w-8 text-label-md font-semibold text-on-surface-variant">{r.index + 1}</span>
              <span className="min-w-0 flex-1">
                <span lang="zh" className="font-serif text-body-lg font-semibold text-on-surface">{r.correctTerm}</span>
                {r.card?.reading && <span className="ml-2 text-label-md text-on-surface-variant">{r.card.reading}</span>}
                {r.translation && <span className="ml-2 text-label-sm text-on-surface-variant">{r.translation}</span>}
              </span>
              <Outcome who="Bạn" answer={r.mine} />
              <Outcome who="Đối thủ" answer={r.theirs} />
              {r.card && (
                <button
                  type="button" aria-pressed={saved} aria-label={`${saved ? "Bỏ lưu" : "Lưu"} từ ${r.card.term}`}
                  onClick={() => toggleSaved(roundCardToSavedItem(r.card!, Date.now()))}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-surface-container ${saved ? "text-primary" : "text-on-surface-variant"}`}
                >
                  <Icon name={saved ? "star" : "star_border"} filled={saved} size={20} />
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
