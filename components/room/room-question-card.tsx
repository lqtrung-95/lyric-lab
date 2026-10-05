import type { RoomQuestionPublic } from "@/lib/rooms/room-question-types";
import { Icon } from "@/components/ui/icon";

/** Dòng lời có ô trống (hoặc điền sẵn đáp án khi `fill` có giá trị), kèm pinyin và nghĩa dòng. */
export function RoomQuestionLine({ q, fill }: { q: RoomQuestionPublic; fill?: string }) {
  const hasPinyin = q.pinyinBefore !== null && q.pinyinAfter !== null;
  return (
    <div className="rounded-2xl bg-surface-container-low px-space-md py-space-lg text-center">
      {hasPinyin && (
        <p className="text-label-md tracking-wide text-on-surface-variant">
          {q.pinyinBefore} <span className="font-semibold text-primary">{fill ? "✓" : "[ ? ]"}</span> {q.pinyinAfter}
        </p>
      )}
      <p lang="zh" className="mt-1 font-serif text-[1.75rem] leading-snug text-on-surface md:text-[2.25rem]">
        {q.before}
        <span className={`mx-1 inline-block min-w-12 rounded-lg px-2 ${fill ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-highest text-primary"}`}>{fill ?? "?"}</span>
        {q.after}
      </p>
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
