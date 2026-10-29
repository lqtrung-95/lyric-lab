import { TEACH_MAX_LEVEL, isForgotten, type TaughtWord } from "@/lib/pet/pet-teach";

/** Sổ từ pet đã được dạy: mức nhớ bằng chữ ("Nhớ 2/3") và nhãn "đã quên", không chỉ dựa vào màu. `now` truyền từ ngoài để vẽ không phụ thuộc đồng hồ. */
export function PetTeachBook({ name, words, now }: { name: string; words: readonly TaughtWord[]; now: number }) {
  if (words.length === 0) return null;
  const shown = [...words].sort((a, b) => b.lastAt - a.lastAt).slice(0, 12);
  return (
    <div className="mt-2">
      <p className="text-label-md font-bold">Sổ từ của {name} ({words.length} từ)</p>
      <ul className="mt-1 flex flex-wrap gap-2">
        {shown.map((w) => {
          const forgot = isForgotten(w, now);
          return (
            <li key={w.term} className={`rounded-xl border-2 px-2 py-1 text-label-md ${forgot ? "border-dashed border-outline text-on-surface-variant" : "border-ink bg-surface-container-lowest"}`}>
              <span lang="zh" className="font-serif text-lg">{w.term}</span>
              <span className="ml-1 font-medium">{w.meaning}</span>
              <span className="ml-1 font-bold">{forgot ? "· đã quên, dạy lại nhé" : `· nhớ ${w.level}/${TEACH_MAX_LEVEL}`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
