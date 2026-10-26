import { formatMeanings } from "@/lib/tra-tu/format-meanings";
import type { WordReading } from "@/lib/tra-tu/types";

/** Nghĩa tiếng Anh theo từng cách đọc (CC-CEDICT) và lượng từ. Từ nhiều âm có một khối cho mỗi cách đọc. */
export function WordMeanings({ readings }: { readings: WordReading[] }) {
  const multi = readings.length > 1;
  return (
    <section aria-label="Nghĩa tiếng Anh" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Nghĩa (tiếng Anh, từ CC-CEDICT)</h2>
      {readings.map((r) => {
        const { senses, classifiers } = formatMeanings(r.meanings);
        return (
          <div key={r.pinyin} className="space-y-1">
            {multi && <h3 className="text-body-lg font-bold text-primary">{r.pinyin}{r.hskLevel != null && <span className="ml-2 text-label-md text-on-surface-variant">HSK {r.hskLevel}</span>}</h3>}
            <ol className="list-decimal space-y-1 pl-6 text-body-md marker:font-bold marker:text-on-surface-variant">
              {senses.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            {classifiers.length > 0 && (
              <p className="text-body-md"><span className="text-on-surface-variant">Lượng từ: </span>
                {classifiers.map((c, i) => <span key={c.text}>{i > 0 && ", "}<b lang="zh-Hans">{c.text}</b> ({c.pinyin})</span>)}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
