export type NoteState = "ask" | "correct" | "partial" | "wrong";

const RING: Record<NoteState, string> = {
  ask: "ring-primary/30",
  correct: "ring-secondary bg-secondary-container/60 anim-note-pop",
  partial: "ring-tertiary bg-tertiary-fixed/50 anim-note-pop",
  wrong: "ring-error bg-error-container/50 anim-note-shake",
};

/**
 * Khuông nhạc với một "nốt" chứa chữ Hán trượt vào giữa (đổi `noteKey` để chạy lại hiệu ứng). Trạng thái đúng/sai đổi màu viền
 * và kiểu chuyển động; màu không phải cách duy nhất báo kết quả (văn bản phản hồi nằm ngay dưới).
 */
export function NoteStaff({ term, state, noteKey }: { term: string; state: NoteState; noteKey: string }) {
  return (
    <div aria-hidden="true" className="relative mx-auto flex h-40 w-full items-center justify-center overflow-hidden rounded-3xl bg-surface-container-low">
      <div className="absolute inset-x-6 top-1/2 h-20 -translate-y-1/2 bg-[repeating-linear-gradient(to_bottom,var(--outline-variant)_0,var(--outline-variant)_1.5px,transparent_1.5px,transparent_20px)]" />
      <div key={noteKey} className="anim-note-in relative">
        <div className={`flex min-w-28 items-center justify-center rounded-[2.5rem] bg-surface-container-lowest px-8 py-2 shadow-md ring-4 transition-colors ${RING[state]}`}>
          <span lang="zh" className="font-serif text-[52px] font-medium leading-tight text-on-surface">{term}</span>
        </div>
      </div>
    </div>
  );
}
