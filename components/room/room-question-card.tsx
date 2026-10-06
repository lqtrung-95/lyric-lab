import type { RoomQuestionPublic } from "@/lib/rooms/room-question-types";
import { Icon } from "@/components/ui/icon";
import { alignPinyinToText, type PinyinChar } from "@/lib/rooms/align-pinyin";

function Segment({ aligned }: { aligned: PinyinChar[] }) {
  return (
    <>
      {aligned.map((c, i) =>
        c.py ? <ruby key={i} className="mx-0.5">{c.ch}<rt className="font-sans text-label-md font-normal tracking-wide text-on-surface-variant">{c.py}</rt></ruby> : <span key={i}>{c.ch}</span>,
      )}
    </>
  );
}

/**
 * Dòng lời có ô trống (hoặc điền sẵn đáp án khi `fill` có giá trị), kèm nghĩa dòng. Pinyin hiện ngay trên từng chữ Hán (ruby) khi
 * ghép khớp được cả phần trước lẫn sau ô trống; không khớp thì giữ một dòng pinyin riêng phía trên (an toàn hơn là căn sai chữ).
 */
export function RoomQuestionLine({ q, fill }: { q: RoomQuestionPublic; fill?: string }) {
  const before = alignPinyinToText(q.before, q.pinyinBefore);
  const after = alignPinyinToText(q.after, q.pinyinAfter);
  const blank = (
    <span className={`mx-1 inline-block min-w-[1.6em] rounded-md px-2 py-0.5 text-[0.8em] leading-tight ${fill ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-highest text-primary"}`}>{fill ?? "?"}</span>
  );
  // Ô trống không lộ cách đọc; "?" nhỏ phía trên giữ cho hàng pinyin đều, còn dấu ✓ báo đã điền.
  const mark = fill ? "✓" : "?";
  return (
    <div className="rounded-2xl bg-surface-container-low px-space-md py-space-lg text-center">
      {before && after ? (
        <p lang="zh" className="font-serif text-[1.75rem] leading-[2.1] text-on-surface md:text-[2.25rem] md:leading-[2.1]">
          <Segment aligned={before} />
          <ruby className="mx-0.5">{blank}<rt className="font-sans text-label-md font-semibold text-primary">{mark}</rt></ruby>
          <Segment aligned={after} />
        </p>
      ) : (
        <>
          {q.pinyinBefore !== null && q.pinyinAfter !== null && (
            <p className="text-label-md tracking-wide text-on-surface-variant">
              {q.pinyinBefore} <span className="font-semibold text-primary">{mark}</span> {q.pinyinAfter}
            </p>
          )}
          <p lang="zh" className="mt-1 font-serif text-[1.75rem] leading-snug text-on-surface md:text-[2.25rem]">{q.before}{blank}{q.after}</p>
        </>
      )}
      {q.translation && <p className="mt-1 text-body-md italic text-on-surface-variant">&ldquo;{q.translation}&rdquo;</p>}
    </div>
  );
}

/** Ghi chú ngữ pháp của dòng (chỉ có khi không làm lộ đáp án). */
export function RoomGrammarNote({ note }: { note: NonNullable<RoomQuestionPublic["grammarNote"]> }) {
  return (
    <aside aria-label="Ghi chú ngữ pháp ca từ" className="rounded-2xl border-l-4 border-primary bg-surface-container-low p-space-md">
      <p className="flex items-center gap-2 text-label-md font-semibold tracking-wide text-primary"><Icon name="menu_book" size={18} /> GHI CHÚ NGỮ PHÁP CA TỪ</p>
      <p lang="zh" className="mt-1 font-serif text-body-lg font-semibold text-on-surface">{note.pattern}</p>
      <p className="mt-1 text-body-md text-on-surface-variant">{note.explanation}</p>
    </aside>
  );
}
