import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HskVocabTable } from "@/components/tools/hsk-vocab-table";
import { SITE_URL } from "@/lib/seo/site-url";
import { HSK_LEVELS, isHskLevel } from "@/lib/tools/build-hsk-rows";
import { getHskRows } from "@/lib/tools/hsk-vocab";

// Dựng khi có người truy cập (không đọc DB lúc build); cấp ngoài 1–6 trả 404; dữ liệu được nhớ 1 ngày trong `getHskRows`.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ level: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = Number((await params).level);
  if (!isHskLevel(level)) return {};
  const count = (await getHskRows(level)).length;
  const title = `Từ vựng HSK ${level} (${count} từ) có pinyin và âm Hán Việt | SongHanzi`;
  const description = `Toàn bộ ${count} từ vựng HSK ${level} theo HSK 3.0 kèm pinyin, âm Hán Việt và nghĩa. Tìm nhanh, tải CSV để nạp vào Anki. Miễn phí.`;
  return {
    title: { absolute: title }, description, alternates: { canonical: `/tu-vung-hsk/${level}` },
    openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title, description, url: `/tu-vung-hsk/${level}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Danh sách từ vựng một cấp HSK (1–6): bảng có tìm kiếm, tải CSV, chuyển nhanh giữa các cấp. */
export default async function HskLevelPage({ params }: Props) {
  const level = Number((await params).level);
  if (!isHskLevel(level)) notFound();
  const rows = await getHskRows(level);
  const jsonLd = { "@context": "https://schema.org", "@type": "ItemList", name: `Từ vựng HSK ${level}`, url: `${SITE_URL}/tu-vung-hsk/${level}`, numberOfItems: rows.length };
  return (
    <div className="mx-auto max-w-5xl space-y-space-md pb-space-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/tu-vung-hsk" className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">← Tất cả cấp HSK</Link>
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Từ vựng HSK {level}</h1>
        <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">{rows.length} từ của cấp HSK {level} (HSK 3.0) kèm pinyin, âm Hán Việt và nghĩa, xếp từ từ thường gặp nhất.</p>
      </header>
      <nav aria-label="Chọn cấp HSK" className="flex flex-wrap gap-2">
        {HSK_LEVELS.map((l) => (
          <Link key={l} href={`/tu-vung-hsk/${l}`} aria-current={l === level ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-medium ${l === level ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}>
            HSK {l}
          </Link>
        ))}
      </nav>
      <HskVocabTable level={level} rows={rows} />
      <p className="text-label-md text-on-surface-variant">
        Nghĩa lấy từ từ điển CC-CEDICT (CC BY-SA 4.0), cấp độ theo danh sách HSK 3.0, âm Hán Việt ghép từ bảng Unihan (chữ nào chưa có trong bảng thì để trống).{" "}
        Muốn học các từ này qua bài hát và video thật? <Link href="/app" className="font-semibold text-primary underline underline-offset-2">Mở SongHanzi</Link>
      </p>
    </div>
  );
}
