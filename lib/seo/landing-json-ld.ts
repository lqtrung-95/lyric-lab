import { SITE_URL } from "./site-url";

/** Dữ liệu có cấu trúc (schema.org) mô tả Lyric Lab như một ứng dụng web giáo dục miễn phí. */
export function landingJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lyric Lab",
    url: SITE_URL,
    description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "vi",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
