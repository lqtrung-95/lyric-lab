import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

// Chỉ trang giới thiệu được lập chỉ mục. Trang học chứa lời bài hát và trang app là riêng tư/không có giá trị tìm kiếm.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/learn/", "/library", "/review", "/settings", "/welcome", "/api/", "/auth/", "/dev/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
