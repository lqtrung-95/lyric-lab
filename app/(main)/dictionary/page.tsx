import type { Metadata } from "next";
import { RecentSearches } from "@/components/tra-tu/recent-searches";
import { SearchBox } from "@/components/tra-tu/search-box";
import { WordResultRow } from "@/components/tra-tu/word-result-row";
import { searchWords } from "@/lib/tra-tu/server-search";
import type { WordResult } from "@/lib/tra-tu/types";

export const metadata: Metadata = { title: "Tra từ", robots: { index: false } };

const TIPS = [
  { label: "Chữ Hán", example: "喜欢 · 愛 (cả phồn thể)" },
  { label: "Pinyin", example: "xihuan · xǐ huan · xi3huan" },
  { label: "Hán Việt", example: "thành thị · thanh thi" },
  { label: "Nghĩa", example: "love · city · yêu · thành phố" },
];

async function load(q: string): Promise<{ results: WordResult[]; failed: boolean }> {
  try { return { results: await searchWords(q, 40), failed: false }; } catch (error) {
    console.error(JSON.stringify({ event: "tra_tu_page_error", message: (error as Error).message }));
    return { results: [], failed: true };
  }
}

export default async function TraTuPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q: raw } = await searchParams;
  const q = (typeof raw === "string" ? raw : "").trim().slice(0, 80);
  const { results, failed } = q ? await load(q) : { results: [], failed: false };

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <header className="space-y-1">
        <h1 className="text-headline-lg font-extrabold">Tra từ</h1>
        <p className="text-body-md text-on-surface-variant">Từ điển tiếng Trung cho người Việt: pinyin, Hán Việt, nghĩa và câu thật từ bài hát, video.</p>
      </header>
      <SearchBox key={q} initialQuery={q} autoFocus={!q} />

      {q ? (
        <section aria-label="Kết quả tra" className="space-y-2">
          <h2 className="text-headline-sm font-extrabold">{failed ? "Chưa tra được" : `${results.length} kết quả cho “${q}”`}</h2>
          {failed && <p role="alert" className="card-ink bg-error-container p-space-sm text-on-error-container">Từ điển đang trục trặc, bạn thử lại sau ít phút nhé.</p>}
          {!failed && results.length === 0 && <p className="card-ink p-space-sm text-body-md">Không tìm thấy “{q}”. Thử chữ Hán, pinyin không dấu hoặc nghĩa tiếng Anh nhé.</p>}
          {results.length > 0 && <ul className="card-ink divide-y divide-outline-variant bg-surface-container-lowest p-1">{results.map((w) => <li key={`${w.simplified}|${w.traditional}`}><WordResultRow word={w} /></li>)}</ul>}
        </section>
      ) : (
        <>
          <RecentSearches />
          <section aria-label="Gợi ý cách tra" className="card-ink bg-surface-container-lowest p-space-md">
            <h2 className="text-headline-sm font-extrabold">Bạn có thể gõ</h2>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              {TIPS.map((t) => <div key={t.label}><dt className="text-label-md font-bold text-primary">{t.label}</dt><dd className="text-body-md">{t.example}</dd></div>)}
            </dl>
          </section>
        </>
      )}
    </div>
  );
}
