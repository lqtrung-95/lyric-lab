import Link from "next/link";
import { Icon } from "@/components/ui/icon";

interface Missed {
  key: string;
  term: string;
  pinyin: string | null;
  meaning: string;
}

interface PracticeSummaryProps {
  title: string;
  stats: { label: string; value: string }[];
  missed: Missed[];
  /** Số thẻ đã được cập nhật lịch ôn nhờ lượt chơi này (chỉ Gõ pinyin và Điền lời). */
  scheduled?: number;
  onAgain: () => void;
}

/** Màn kết quả chung: số liệu, các từ cần ôn lại và hai hành động tiếp theo. */
export function PracticeSummary({ title, stats, missed, scheduled, onAgain }: PracticeSummaryProps) {
  return (
    <section aria-labelledby="summary-heading" className="rounded-3xl bg-surface-container-lowest p-space-lg text-center shadow-[0_1px_10px_rgba(30,26,22,0.08)]">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><Icon name="check_circle" filled size={30} /></span>
      <h2 id="summary-heading" className="mt-space-sm font-serif text-headline-md">{title}</h2>
      <dl className="mt-space-md grid grid-cols-2 gap-space-sm sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-container-low p-space-sm">
            <dt className="text-label-md text-on-surface-variant">{s.label}</dt>
            <dd className="font-serif text-headline-md text-on-surface">{s.value}</dd>
          </div>
        ))}
      </dl>
      {scheduled !== undefined && scheduled > 0 && (
        <p className="mt-space-md text-body-md text-on-surface-variant">Lịch ôn của <strong>{scheduled}</strong> thẻ đã được cập nhật theo kết quả.</p>
      )}
      {missed.length > 0 && (
        <div className="mt-space-md text-left">
          <h3 className="text-label-md font-semibold uppercase tracking-wider text-secondary">Cần ôn lại</h3>
          <ul className="mt-2 divide-y divide-surface-container-high rounded-2xl bg-surface-container-low">
            {missed.map((m) => (
              <li key={m.key} className="flex flex-wrap items-baseline gap-x-3 px-4 py-2">
                <span lang="zh" className="font-serif text-headline-md text-on-surface">{m.term}</span>
                {m.pinyin && <span className="text-pinyin-reading text-primary">{m.pinyin}</span>}
                <span className="text-body-md text-on-surface-variant">{m.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-space-lg flex flex-col justify-center gap-space-sm sm:flex-row">
        <button type="button" onClick={onAgain} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">Chơi lại</button>
        <Link href="/review" className="inline-flex min-h-12 items-center justify-center rounded-full bg-surface-container-high px-6 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest">Về ôn tập</Link>
      </div>
    </section>
  );
}
