import { PronounceButton } from "@/components/ui/pronounce-button";
import { WEEKDAYS } from "@/lib/tools/everyday/days-data";

/** Bảy ngày trong tuần: dạng 星期, dạng viết tắt 周 và nghĩa tiếng Việt, mỗi ngày có nút nghe. */
export function WeekdayGrid() {
  return (
    <section aria-labelledby="weekday-heading">
      <h2 id="weekday-heading" className="font-serif text-headline-md">Bảy ngày trong tuần</h2>
      <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {WEEKDAYS.map((d) => (
          <li key={d.zh} className="card-ink flex items-start gap-3 p-space-sm">
            <div className="min-w-0 flex-1">
              <p lang="zh" className="font-serif text-headline-md">{d.zh}</p>
              <p className="text-body-md text-primary">{d.pinyin}</p>
              <p className="text-body-lg font-medium text-on-surface">{d.vi}</p>
              <p className="mt-1 text-body-sm text-on-surface-variant"><span lang="zh">{d.short}</span> ({d.shortPinyin}){d.alt && <> · <span lang="zh">{d.alt}</span> ({d.altPinyin})</>}</p>
            </div>
            <PronounceButton text={d.zh} className="size-10" />
          </li>
        ))}
      </ul>
    </section>
  );
}
