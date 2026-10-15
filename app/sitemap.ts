import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";
import { HSK_LEVELS } from "@/lib/tools/build-hsk-rows";
import { TOOLS } from "@/lib/tools/tool-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/cong-cu`, changeFrequency: "monthly", priority: 0.7 },
    ...TOOLS.map((t) => ({ url: `${SITE_URL}${t.href}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...["bang-pinyin", "luyen-thanh-dieu", "nghe-doan-thanh"].map((slug) => ({ url: `${SITE_URL}/phat-am/${slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...HSK_LEVELS.map((l) => ({ url: `${SITE_URL}/tu-vung-hsk/${l}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
