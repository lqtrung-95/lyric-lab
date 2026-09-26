export type ClozeReveal = "correct" | "wrong" | null;

/** Câu hát có chỗ trống: khi đã trả lời thì điền đáp án đúng vào và tô màu theo kết quả (không chỉ dựa vào màu: chữ đáp án hiện ra). */
export function ClozeLine({ before, after, answer, reveal }: { before: string; after: string; answer: string; reveal: ClozeReveal }) {
  const color = reveal === null
    ? "border-outline bg-surface-container-high text-transparent"
    : reveal === "correct" ? "border-secondary bg-secondary-container/50 text-on-secondary-container" : "border-primary bg-primary-container/30 text-primary";
  return (
    <p lang="zh" className="font-serif text-[30px] leading-snug text-on-surface">
      {before}
      <span className={`mx-1 inline-block min-w-16 rounded-lg border-b-4 px-2 text-center ${color}`}>
        {reveal === null ? "＿＿" : answer}
        {reveal === null && <span className="sr-only">chỗ trống</span>}
      </span>
      {after}
    </p>
  );
}
