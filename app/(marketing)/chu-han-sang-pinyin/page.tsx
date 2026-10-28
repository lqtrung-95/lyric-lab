import type { Metadata } from "next";
import Link from "next/link";
import { HanConverter } from "@/components/tools/han-converter";
import { SITE_URL } from "@/lib/seo/site-url";

const TITLE = "Chuyển chữ Hán sang pinyin và âm Hán Việt (miễn phí) | SongHanzi";
const DESCRIPTION = "Dán chữ Hán (giản thể hoặc phồn thể) để có pinyin có dấu thanh và âm Hán Việt từng từ, sao chép được. Miễn phí, không cần đăng ký, dữ liệu từ CC-CEDICT và Unihan.";

const FAQ = [
  { q: "Công cụ này chuyển được những gì?", a: "Chữ Hán giản thể hoặc phồn thể thành pinyin có dấu thanh và âm Hán Việt, tách theo từng từ (ví dụ 学生 → xué sheng, học sinh). Mỗi lần tối đa 600 chữ." },
  { q: "Pinyin và âm Hán Việt lấy từ đâu?", a: "Pinyin lấy từ từ điển CC-CEDICT, tách từ bằng thuật toán jieba, nên từ nhiều âm thường ra đúng âm thông dụng. Âm Hán Việt ghép từ bảng Unihan; chữ nào chưa có trong bảng thì để trống thay vì đoán." },
  { q: "Vì sao âm Hán Việt đôi khi khác cách người Việt quen đọc?", a: "Một số chữ có nhiều âm Hán Việt hoặc cả âm Nôm. Công cụ lấy âm phổ biến nhất của từng chữ, nên với chữ đa âm bạn nên đối chiếu thêm với từ điển Hán Việt." },
  { q: "Tôi có cần tạo tài khoản không?", a: "Không. Công cụ miễn phí, không lưu văn bản bạn nhập." },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/chu-han-sang-pinyin" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title: TITLE, description: DESCRIPTION, url: "/chu-han-sang-pinyin" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const jsonLd = [
  {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Chuyển chữ Hán sang pinyin và âm Hán Việt", url: `${SITE_URL}/chu-han-sang-pinyin`,
    description: DESCRIPTION, applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "vi", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
];

/** Trang công cụ công khai (được lập chỉ mục): chuyển chữ Hán sang pinyin và âm Hán Việt. Không chứa lời bài hát. */
export default function HanToPinyinPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-space-lg pb-space-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/tools" className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">← Tất cả công cụ</Link>
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Chuyển chữ Hán sang pinyin và âm Hán Việt</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">Dán chữ Hán vào ô dưới, nhận pinyin có dấu thanh và âm Hán Việt của từng từ. Miễn phí, không cần đăng ký.</p>
      </header>
      <HanConverter />
      <section aria-labelledby="faq-heading" className="pt-space-md">
        <h2 id="faq-heading" className="font-serif text-headline-md">Câu hỏi thường gặp</h2>
        <dl className="mt-space-sm space-y-space-sm">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="text-body-lg font-medium text-on-surface">{f.q}</dt>
              <dd className="mt-1 text-body-md text-on-surface-variant">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
