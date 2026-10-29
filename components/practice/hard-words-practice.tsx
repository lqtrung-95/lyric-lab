"use client";

import { useMemo, useState } from "react";
import { ModeTabs } from "@/components/review/mode-tabs";
import { pickHardWords } from "@/lib/review/hard-words";
import { submitRoundScore } from "@/lib/practice/submit-score";
import { MatchGame } from "./match-game";
import { PinyinGame } from "./pinyin-game";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";

type Game = "list" | "match" | "pinyin";

/**
 * "Từ khó của bạn": gom các từ hay quên nhất (số lần quên + độ khó FSRS của thẻ, xem `lib/review/hard-words.ts`) để luyện riêng bằng Ghép cặp hoặc Gõ pinyin.
 * Chấm bằng chính lịch FSRS như các chế độ thường (Gõ pinyin ghi lịch khi thẻ đến hạn); Ghép cặp chỉ luyện thêm.
 */
export function HardWordsPractice() {
  const { status, cards, grade } = usePracticePool();
  const [game, setGame] = useState<Game>("list");
  const hard = useMemo(() => pickHardWords(cards), [cards]);
  const matchable = hard.filter((c) => c.meaning);
  const pinyinable = hard.filter((c) => c.pinyin);
  return (
    <>
      <ModeTabs />
      <PracticeFrame
        title="Từ khó của bạn" status={status}
        intro="Những từ bạn hay quên nhất, xếp từ khó nhất. Luyện riêng chúng để từ khó thành từ quen."
        blocked={hard.length === 0 ? "Chưa có từ nào bị đánh dấu khó. Ôn thẻ đều đặn, từ nào hay quên sẽ hiện ở đây." : null}
      >
        {game === "list" && (
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={matchable.length < 4} onClick={() => setGame("match")} className="btn-3d btn-3d-primary min-h-11 px-5 text-label-md font-extrabold disabled:opacity-50">Ghép cặp {matchable.length < 4 ? "(cần ≥ 4 từ)" : `${Math.min(matchable.length, 8)} từ khó`}</button>
              <button type="button" disabled={pinyinable.length === 0} onClick={() => setGame("pinyin")} className="btn-3d btn-3d-neutral min-h-11 px-5 text-label-md font-extrabold disabled:opacity-50">Gõ pinyin</button>
            </div>
            <ol aria-label="Danh sách từ khó" className="flex flex-col gap-2">
              {hard.map((c, i) => (
                <li key={c.item_key} className="card-ink flex flex-wrap items-center gap-x-3 gap-y-1 p-space-sm">
                  <span className="w-6 text-label-md font-bold text-on-surface-variant">{i + 1}.</span>
                  <span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{c.term}</span>
                  {c.pinyin && <span className="text-pinyin-reading text-primary">{c.pinyin}</span>}
                  <span className="min-w-0 flex-1 text-body-md">{c.meaning}</span>
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm font-bold">{c.lapses > 0 ? `quên ${c.lapses} lần` : "khó nhớ"}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {game !== "list" && (
          <div className="flex flex-col gap-space-sm">
            <button type="button" onClick={() => setGame("list")} className="min-h-11 w-fit rounded-full px-3 text-label-md font-bold underline">← Danh sách từ khó</button>
            {game === "match" && <MatchGame cards={matchable.slice(0, 8)} onRoundEnd={(r) => void submitRoundScore("match", r)} />}
            {game === "pinyin" && <PinyinGame cards={pinyinable} grade={grade} onRoundEnd={(r) => void submitRoundScore("pinyin", r)} />}
          </div>
        )}
      </PracticeFrame>
    </>
  );
}
