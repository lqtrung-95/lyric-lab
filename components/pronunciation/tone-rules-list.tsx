import { TONE_RULES, TONES } from "@/lib/pronunciation/tone-data";

/** Mô tả bốn thanh và các quy tắc biến thanh: nội dung tĩnh, hiển thị cho cả người dùng và công cụ tìm kiếm. */
export function ToneRulesList() {
  return (
    <div className="space-y-space-lg">
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {TONES.map((t) => (
          <li key={t.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-space-md">
            <h3 className="text-body-lg font-medium">{t.name}: {t.shape} <span className="tabular-nums text-on-surface-variant">({t.chao})</span></h3>
            <p className="mt-1 text-body-md text-on-surface-variant">{t.vietnamese}</p>
            <p className="mt-1 text-body-md">Ví dụ: <span lang="zh-Hans" className="font-serif">{t.example.han}</span> {t.example.pinyin}</p>
          </li>
        ))}
      </ul>
      <div>
        <h3 className="font-serif text-headline-md">Quy tắc biến thanh</h3>
        <ul className="mt-space-sm space-y-space-sm">
          {TONE_RULES.map((r) => (
            <li key={r.title} className="rounded-xl border border-outline-variant p-space-md">
              <p className="text-body-lg font-medium">{r.title}</p>
              <p className="mt-1 text-body-md text-on-surface-variant">{r.body}</p>
              <p lang="zh-Hans" className="mt-1 text-body-md">{r.example}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
