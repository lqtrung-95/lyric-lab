import { Icon } from "@/components/ui/icon";

const PAIN = [
  "Nghe nhạc Hoa mà không hiểu lời, chỉ ậm ừ theo giai điệu",
  "Học từ vựng bằng danh sách khô khan, học xong quên sạch sau một tuần",
  "Tra từng chữ trong lời hát mất cả buổi, chưa kịp hiểu thì bài đã hết",
];
const GAIN = [
  "Mỗi bài hát thành một bài học ngắn với đúng những từ đáng học",
  "Từ nằm trong câu hát bạn thích nên nhớ được ngữ cảnh và cảm xúc",
  "Ôn lại đúng lúc sắp quên, mỗi ngày vài phút là đủ",
];

/** Đối chiếu "trước đây" và "với Lyric Lab", giọng văn gần gũi. */
export function ProblemSolution() {
  return (
    <section aria-labelledby="problem-heading" className="mt-24">
      <h2 id="problem-heading" className="max-w-3xl font-serif text-headline-lg-mobile md:text-headline-xl">
        Bạn thích nhạc Hoa, nhưng lời bài hát vẫn là một bức tường chữ Hán
      </h2>
      <div className="mt-space-lg grid gap-space-md md:grid-cols-2">
        <div className="rounded-3xl bg-surface-container-low p-space-lg">
          <p className="text-label-md font-semibold uppercase tracking-widest text-on-surface-variant">Trước đây</p>
          <ul className="mt-space-md space-y-space-md">
            {PAIN.map((t) => (
              <li key={t} className="flex gap-3 text-body-lg text-on-surface-variant"><Icon name="close" size={22} className="mt-0.5 shrink-0 text-outline" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-primary-container/25 p-space-lg ring-1 ring-primary/20">
          <p className="text-label-md font-semibold uppercase tracking-widest text-primary">Với Lyric Lab</p>
          <ul className="mt-space-md space-y-space-md">
            {GAIN.map((t) => (
              <li key={t} className="flex gap-3 text-body-lg text-on-surface"><Icon name="check_circle" size={22} filled className="mt-0.5 shrink-0 text-secondary" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
