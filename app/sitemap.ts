import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/chu-han-sang-pinyin`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
