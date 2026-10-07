import type { Comprehension } from "@/lib/preview/comprehension";

/** Thanh "Bạn hiểu khoảng X% bài này" kèm mục tiêu cụ thể: học thêm N từ nữa để chạm 80%. Là ước tính theo level và từ đã đánh dấu đã biết. */
export function ComprehensionBanner({ value }: { value: Comprehension }) {
  const { percent, wordsTo80, percentIfAllLearned, toLearn } = value;
  const message = wordsTo80 === 0
    ? "Bạn đã hiểu phần lớn bài này. Nghe thôi!"
    : wordsTo80 === null
      ? <>Học hết <strong className="text-on-surface">{toLearn} từ</strong> cốt lõi bên dưới để hiểu khoảng {percentIfAllLearned}% bài này.</>
      : <>Học thêm <strong className="text-on-surface">{wordsTo80} từ</strong> nữa để hiểu khoảng 80% bài này.</>;
  return (
    <section aria-label="Độ hiểu được của bài" className="mb-space-md rounded-2xl bg-surface-container-low p-space-md">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-body-md text-on-surface-variant">Bạn hiểu khoảng <strong className="font-serif text-headline-md text-primary">{percent}%</strong> bài này <span className="text-label-sm">(ước tính)</span></p>
        <p className="text-label-md text-on-surface-variant">{message}</p>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Độ hiểu được của bài" className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-highest">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
