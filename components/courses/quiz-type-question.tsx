"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { checkPinyinInput } from "@/lib/courses/quiz-extra";
import type { UnitWord } from "@/lib/courses/unit-types";
import { playSfx } from "@/lib/feedback/sfx";
import { playChinese } from "@/lib/speech/play-chinese";
import type { QuizResult } from "./quiz-result";

/**
 * Nghe và gõ pinyin: nghe từ rồi gõ pinyin (gõ có dấu "cān yǐn", số "can1 yin3" hoặc không thanh "can yin" đều được).
 * Đúng âm nhưng chưa gõ thanh vẫn tính đúng kèm nhắc thanh; sai thì hiện pinyin đúng.
 */
export function QuizTypeQuestion({ word, onDone }: { word: UnitWord; onDone: (r: QuizResult) => void }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkPinyinInput> | null>(null);

  function check() {
    if (!value.trim() || result) return;
    const r = checkPinyinInput(value, word.pinyin);
    setResult(r);
    playSfx(r === "wrong" ? "wrong" : "correct");
    onDone({ correct: r !== "wrong", right: r === "wrong" ? [] : [word.term], wrong: r === "wrong" ? [word.term] : [] });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); check(); }} className="space-y-space-sm">
      <button type="button" onClick={() => void playChinese(word.term)} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">
        <Icon name="volume_up" size={24} filled /> Nghe
      </button>
      <label className="block text-label-md font-bold">
        Gõ pinyin (có thể gõ dấu, số thanh hoặc không thanh)
        <input value={value} onChange={(e) => setValue(e.target.value)} disabled={result !== null} autoComplete="off" autoCapitalize="off" spellCheck={false} lang="zh-Latn-pinyin"
          placeholder="ví dụ: ni3 hao hoặc nǐ hǎo" className="mt-1 min-h-12 w-full rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-lg font-normal disabled:opacity-70" />
      </label>
      {result === null ? (
        <button type="submit" disabled={!value.trim()} className="btn-3d btn-3d-secondary disabled:opacity-50">Kiểm tra</button>
      ) : (
        <div role="status" className="space-y-1">
          {result === "exact" && <p className="text-body-lg font-bold">Chính xác!</p>}
          {result === "toneless" && <p className="text-body-lg font-bold">Đúng âm! Nhớ thêm thanh điệu: <span className="text-primary">{word.pinyin}</span></p>}
          {result === "wrong" && <p className="text-body-lg font-bold">Chưa đúng. Pinyin đúng là: <span className="text-primary">{word.pinyin}</span></p>}
          <p lang="zh-Hans" className="font-serif text-3xl">{word.term}</p>
        </div>
      )}
    </form>
  );
}
