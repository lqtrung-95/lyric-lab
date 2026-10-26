import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo/site-url";
import { HSK_LEVELS } from "@/lib/tools/build-hsk-rows";
import { getHskRows } from "@/lib/tools/hsk-vocab";

// Dựng khi có người truy cập (không đọc DB lúc build, để DB trục trặc không làm hỏng deploy); dữ liệu được nhớ 1 ngày trong `getHskRows`.
export const dynamic = "force-dynamic";

const TITLE = "Từ vựng HSK 1–6 có pinyin và âm Hán Việt | SongHanzi";
const DESCRIPTION = "Danh sách từ vựng HSK 3.0 cấp 1 đến 6 kèm pinyin, âm Hán Việt và nghĩa. Tìm nhanh trong từng cấp, tải CSV để nạp vào Anki. Miễn phí.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/tu-vung-hsk" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title: TITLE, description: DESCRIPTION, url: "/tu-vung-hsk" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** Mục lục các cấp HSK (1–6) với số từ của từng cấp. */
export default async function HskVocabIndexPage() {
  const counts = await Promise.all(HSK_LEVELS.map(async (l) => [l, (await getHskRows(l)).length] as const));
  const jsonLd = {
    "@context": "https://schema.org", "@type": "ItemList", name: "Từ vựng HSK 3.0 cấp 1–6", url: `${SITE_URL}/tu-vung-hsk`,
    itemListElement: counts.map(([l, n], i) => ({ "@type": "ListItem", position: i + 1, name: `Từ vựng HSK ${l} (${n} từ)`, url: `${SITE_URL}/tu-vung-hsk/${l}` })),
  };
  return (
    <div className="mx-auto max-w-5xl space-y-space-lg pb-space-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/cong-cu" className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">← Tất cả công cụ</Link>
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Từ vựng HSK có âm Hán Việt</h1>
        <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">Chọn một cấp để xem danh sách từ kèm pinyin, âm Hán Việt và nghĩa tiếng Anh, xếp từ từ thường gặp nhất. Tìm nhanh trong từng cấp và tải CSV để nạp vào Anki.</p>
      </header>
      <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(([l, n]) => (
          <li key={l}>
            <Link href={`/tu-vung-hsk/${l}`} className="flex h-full min-h-28 flex-col gap-1 card-ink p-space-md transition-colors hover:bg-surface-container-high">
              <span className="font-serif text-headline-md text-on-surface">HSK {l}</span>
              <span className="text-label-md text-on-surface-variant">{n} từ</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-label-md text-on-surface-variant">Nghĩa lấy từ từ điển CC-CEDICT (CC BY-SA 4.0), cấp độ theo danh sách HSK 3.0, âm Hán Việt ghép từ bảng Unihan (chữ nào chưa có trong bảng thì để trống).</p>
    </div>
  );
}
