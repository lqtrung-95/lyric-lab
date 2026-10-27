import { PronounceButton } from "@/components/ui/pronounce-button";
import { SORRY_COMPARE } from "@/lib/tools/everyday/sorry-data";

/** So sánh ba cách xin lỗi chính (对不起, 不好意思, 抱歉): nghĩa, khi nào dùng và một câu ví dụ có nghe. */
export function SorryCompare() {
  return (
    <section aria-labelledby="sorry-compare-heading">
      <h2 id="sorry-compare-heading" className="font-serif text-headline-md">Chọn câu xin lỗi nào?</h2>
      <ul className="mt-space-sm grid gap-gutter md:grid-cols-3">
        {SORRY_COMPARE.map((s) => (
          <li key={s.zh} className="card-ink space-y-2 p-space-sm">
            <p className="flex items-center gap-2"><span lang="zh" className="font-serif text-headline-md">{s.zh}</span><PronounceButton text={s.zh} className="size-9" /></p>
            <p className="text-body-md text-primary">{s.pinyin}</p>
            <p className="text-body-lg font-medium text-on-surface">{s.vi}</p>
            <p className="text-body-md text-on-surface-variant">{s.when}</p>
            <div className="rounded-xl bg-surface-container p-3">
              <p className="flex items-start gap-2"><span lang="zh" className="min-w-0 flex-1 font-serif text-body-lg">{s.example.zh}</span><PronounceButton text={s.example.zh} className="size-9" /></p>
              <p className="text-body-sm text-primary">{s.example.pinyin}</p>
              <p className="text-body-sm text-on-surface-variant">{s.example.vi}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
