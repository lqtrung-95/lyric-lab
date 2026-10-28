import type { Metadata } from "next";
import { ToolsCta } from "@/components/tools/tools-cta";
import { ToolsHub } from "@/components/tools/tools-hub";
import { SITE_URL } from "@/lib/seo/site-url";
import { TOOLS } from "@/lib/tools/tool-registry";

const TITLE = "Công cụ học tiếng Trung miễn phí | SongHanzi";
const DESCRIPTION = "Công cụ miễn phí cho người Việt học tiếng Trung: pinyin và Hán Việt, tờ tập viết chữ Hán, lượng từ, thanh điệu, từ vựng HSK. Không cần đăng ký.";

const FAQ = [
  { q: "Các công cụ của SongHanzi có miễn phí không?", a: "Có. Mọi công cụ ở đây miễn phí, không cần đăng ký và không lưu văn bản bạn nhập." },
  { q: "Dùng công cụ nào để luyện phát âm?", a: "Vào Luyện phát âm tiếng Trung: bảng pinyin có giọng đọc, luyện thanh điệu có chấm cao độ giọng bạn và trò nghe đoán thanh. Muốn biết chữ đọc ra sao thì dùng Chữ Hán sang pinyin." },
  { q: "Làm sao để tìm đúng công cụ?", a: "Gõ vào ô tìm (không dấu cũng được) hoặc chọn một nhóm: Viết chữ, Phát âm, Câu và ngữ pháp, Tiếng Trung hằng ngày, HSK và trình độ." },
  { q: "Các công cụ có dùng được trên điện thoại không?", a: "Có. Mọi công cụ chạy trên trình duyệt điện thoại, máy tính bảng và máy tính." },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/tools" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title: TITLE, description: DESCRIPTION, url: "/tools" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "CollectionPage", name: "Công cụ học tiếng Trung", url: `${SITE_URL}/tools`, description: DESCRIPTION, inLanguage: "vi",
  hasPart: TOOLS.map((t) => ({ "@type": "WebApplication", name: t.title, url: `${SITE_URL}${t.href}`, description: t.description })),
};

/** Mục lục các công cụ công khai (đọc từ `TOOLS`): tìm kiếm, lọc nhóm, "dùng nhiều nhất" và hỏi đáp. Trang được lập chỉ mục và liên kết nội bộ tới từng công cụ. */
export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-space-lg pb-space-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]) }} />
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Công cụ học tiếng Trung miễn phí</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">Tờ tập viết, pinyin, lượng từ, thanh điệu và nhiều hơn nữa. Dùng được ngay, không cần đăng ký.</p>
      </header>
      <ToolsHub tools={TOOLS} />
      <ToolsCta />
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
