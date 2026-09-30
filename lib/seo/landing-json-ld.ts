import { SITE_URL } from "./site-url";

/** Dữ liệu có cấu trúc (schema.org) mô tả SongHanzi như một ứng dụng web giáo dục miễn phí. */
export function landingJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SongHanzi",
    url: SITE_URL,
    description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "vi",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
