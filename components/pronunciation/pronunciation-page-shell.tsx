import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/seo/site-url";

export interface FaqItem { q: string; a: string }

/** Khung chung cho các trang phát âm công khai: liên kết quay lại, tiêu đề, JSON-LD (ứng dụng + hỏi đáp) và mục câu hỏi thường gặp. */
export function PronunciationPageShell({ path, name, description, title, intro, faq, children }: {
  path: string; name: string; description: string; title: string; intro: string; faq: FaqItem[]; children: ReactNode;
}) {
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name, url: `${SITE_URL}${path}`, description, applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "vi", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-space-lg pb-space-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href={path === "/phat-am" ? "/cong-cu" : "/phat-am"} className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">{path === "/phat-am" ? "← Tất cả công cụ" : "← Luyện phát âm"}</Link>
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{title}</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">{intro}</p>
      </header>
      {children}
      <section aria-labelledby="faq-heading" className="pt-space-md">
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

export function pageMetadata(path: string, title: string, description: string) {
  return {
    title: { absolute: title }, description, alternates: { canonical: path },
    openGraph: { type: "website" as const, locale: "vi_VN", siteName: "SongHanzi", title, description, url: path },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
