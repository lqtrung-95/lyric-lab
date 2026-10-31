import Link from "next/link";
import type { HanziInfoView, ComponentRef, StoredEtymologyNote } from "@/lib/tra-tu/hanzi-info-types";
import { ETYMOLOGY_LABEL } from "@/lib/tra-tu/hanzi-structure";
import { radicalByChar } from "@/lib/radicals/radicals-core";
import { EtymologyAiNote } from "./etymology-ai-note";
import { wordHref } from "./word-result-row";

function Part({ c }: { c: ComponentRef }) {
  return (
    <Link href={wordHref(c.char)} className="inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-ink bg-surface-container-lowest px-3 hover:bg-surface-container-low">
      <span lang="zh-Hans" className="font-serif text-xl font-bold">{c.char}</span>{c.sinoViet && <span className="text-label-md text-on-surface-variant">{c.sinoViet}</span>}
    </Link>
  );
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1"><dt className="text-label-md font-bold text-on-surface-variant">{label}</dt><dd className="flex flex-wrap items-center gap-2 text-body-md">{children}</dd></div>
);

/**
 * Chiết tự từng chữ của từ: bộ thủ, cách ghép các thành phần, kiểu cấu tạo (lục thư) và gợi ý nguồn gốc, kèm lời giải thích AI khi người dùng nhờ.
 * Mọi dữ kiện cấu trúc lấy từ Make Me a Hanzi (+ Hán Việt từ bảng Unihan/Wiktionary), không do AI sinh.
 */
export function EtymologySection({ items, notes, canAskAi }: { items: HanziInfoView[]; notes: Record<string, StoredEtymologyNote | null>; canAskAi: boolean }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Chiết tự" className="card-ink space-y-space-md bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Chiết tự</h2>
      {items.map((it) => {
        const e = it.etymology;
        return (
          <article key={it.hanzi} aria-label={`Chiết tự ${it.hanzi}`} className="space-y-space-sm border-t border-outline-variant pt-space-sm first:border-0 first:pt-0">
            <div className="flex items-baseline gap-3">
              <span lang="zh-Hans" className="text-5xl font-extrabold">{it.hanzi}</span>
              <span className="text-body-md">{it.sinoViet.length > 0 && <>Hán Việt: <b>{it.sinoViet.join(", ")}</b></>}{it.definition && <span className="block text-on-surface-variant">{it.definition}</span>}</span>
            </div>
            <dl className="space-y-space-sm">
              <Row label="Bộ thủ"><Part c={it.radical} />{(() => { const r = radicalByChar(it.radical.char); return r ? <Link href={`/radicals/${r.num}`} className="inline-flex min-h-11 items-center text-label-md font-bold text-primary underline">Xem bộ {r.name}</Link> : null; })()}</Row>
              {it.components.length > 0 && <Row label={`Cấu tạo${it.layoutLabel ? ` (${it.layoutLabel})` : ""}`}>{it.components.map((c, i) => <span key={`${c.char}${i}`} className="inline-flex items-center gap-2">{i > 0 && <span aria-hidden="true">+</span>}<Part c={c} /></span>)}</Row>}
              {e && <Row label="Kiểu chữ"><span><b>{ETYMOLOGY_LABEL[e.type].name}</b>: {ETYMOLOGY_LABEL[e.type].meaning}.</span></Row>}
              {e?.semantic && <Row label="Phần chỉ nghĩa"><Part c={e.semantic} /></Row>}
              {e?.phonetic && <Row label="Phần chỉ âm"><Part c={e.phonetic} /></Row>}
              {e?.hint && <Row label="Gợi ý nguồn gốc (tiếng Anh)"><span>{e.hint}</span></Row>}
            </dl>
            <EtymologyAiNote char={it.hanzi} initial={notes[it.hanzi] ?? null} canAskAi={canAskAi} />
          </article>
        );
      })}
      <p className="text-body-sm text-on-surface-variant">
        Dữ liệu bộ thủ, cấu tạo, nguồn gốc: <a href="https://github.com/skishore/makemeahanzi" className="underline" rel="noreferrer">Make Me a Hanzi</a> (từ Unihan và CJKlib), giấy phép{" "}
        <a href="/licenses/LGPL-3.0.txt" className="underline">LGPL v3+</a>.
      </p>
    </section>
  );
}
