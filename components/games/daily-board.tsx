import type { GuessMarks, Mark, Syl } from "@/lib/games/pinyin-parts";

const CELL: Record<Mark, string> = { hit: "bg-emerald-600 text-white", near: "bg-amber-400 text-slate-900", miss: "bg-surface-container-high text-on-surface" };
const LABEL: Record<Mark, string> = { hit: "đúng", near: "có nhưng sai vị trí", miss: "không có" };
const GLYPH: Record<Mark, string> = { hit: "✓", near: "~", miss: "" };
const NAME = ["phụ âm đầu", "vần", "thanh"];

export interface BoardRow { syls: Syl[]; marks: GuessMarks }

function Cell({ text, mark, name }: { text: string; mark: Mark | null; name: string }) {
  return (
    <span role="img" aria-label={mark ? `${name} ${text || "trống"}: ${LABEL[mark]}` : "ô trống"} className={`relative flex h-11 min-w-10 flex-1 items-center justify-center rounded-lg border-2 border-ink font-mono text-base font-extrabold sm:h-12 sm:text-lg ${mark ? CELL[mark] : "bg-surface-container-lowest"}`}>
      {mark ? text || "–" : ""}
      {mark && GLYPH[mark] && <span aria-hidden="true" className="absolute right-0.5 top-0 text-[10px] leading-none">{GLYPH[mark]}</span>}
    </span>
  );
}

/** Bảng đoán 6 hàng: mỗi hàng hai âm tiết, mỗi âm tiết ba ô (phụ âm đầu, vần, thanh). Màu kèm ký hiệu ✓ / ~ để không chỉ dựa vào màu. */
export function DailyBoard({ rows, tries }: { rows: BoardRow[]; tries: number }) {
  return (
    <ol className="flex flex-col gap-1.5" aria-label="Các lượt đoán">
      {Array.from({ length: tries }, (_, r) => {
        const row = rows[r];
        return (
          <li key={r} className="flex gap-3">
            {[0, 1].map((i) => (
              <span key={i} className="flex flex-1 gap-1">
                {[0, 1, 2].map((k) => {
                  const key = (["initial", "final", "tone"] as const)[k];
                  const text = row ? (k === 0 ? row.syls[i].initial : k === 1 ? row.syls[i].final : String(row.syls[i].tone)) : "";
                  return <Cell key={k} text={text} mark={row ? row.marks[key][i] : null} name={NAME[k]} />;
                })}
              </span>
            ))}
          </li>
        );
      })}
    </ol>
  );
}
