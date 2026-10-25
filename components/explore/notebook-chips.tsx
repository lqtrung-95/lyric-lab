"use client";

import type { ObjectMark } from "./scene-canvas";
import type { SceneWord } from "@/lib/explore/explore-types";

/** Sổ tay: các từ đã chạm học. Bấm một từ để xem lại thẻ; từ lâu không gặp có dấu ↻ (cần ôn). */
export function NotebookChips({ words, marks, onPick }: { words: SceneWord[]; marks: Record<string, ObjectMark>; onPick: (w: SceneWord) => void }) {
  const learned = words.filter((w) => marks[w.id] && marks[w.id] !== "new");
  return (
    <section aria-label="Sổ tay" className="card-ink p-space-md">
      <h2 className="text-headline-md">Sổ tay <span className="text-body-md font-bold text-on-surface-variant">{learned.length}/{words.length}</span></h2>
      {learned.length === 0 ? (
        <p className="mt-1 text-body-md text-on-surface-variant">Chạm vào các vật trong phòng, từ bạn học sẽ được ghi vào đây.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {learned.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => onPick(w)} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-low px-3 text-label-md font-extrabold hover:bg-surface-container-high">
                <span lang="zh-Hans">{w.term}</span> <span className="font-normal text-on-surface-variant">{w.gloss}</span>{marks[w.id] === "faded" && <span className="ml-1 text-primary">↻</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
