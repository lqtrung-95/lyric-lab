import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/seo/site-url";

export interface ToolFaq { q: string; a: string }

/** Metadata chuẩn của một trang công cụ công khai (được lập chỉ mục, tiếng Việt). */
export function toolMetadata(href: string, title: string, description: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: href },
    openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title, description, url: href },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Khung trang công cụ: liên kết về mục lục, tiêu đề, mô tả, nội dung công cụ, phần hỏi đáp và dữ liệu có cấu trúc (WebApplication + FAQPage). */
export function ToolPage({ href, name, description, h1, intro, faq, children, wide }: { href: string; name: string; description: string; h1: string; intro: string; faq: ToolFaq[]; children: ReactNode; wide?: boolean }) {
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "WebApplication", name, url: `${SITE_URL}${href}`, description,
      applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "vi", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return (
    <div className={`mx-auto space-y-space-lg pb-space-lg ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/tools" className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline print:hidden">← Tất cả công cụ</Link>
      <header className="print:hidden">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{h1}</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">{intro}</p>
      </header>
      {children}
      <section aria-labelledby="faq-heading" className="pt-space-md print:hidden">
        <h2 id="faq-heading" className="font-serif text-headline-md">Câu hỏi thường gặp</h2>
        <dl className="mt-space-sm space-y-space-sm">
          {faq.map((f) => (
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
