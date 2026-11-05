import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

// Chỉ trang giới thiệu và trang công cụ (không chứa lời bài hát) được lập chỉ mục. Trang học chứa lời bài hát và trang app là riêng tư/không có giá trị tìm kiếm.
// `/dictionary` (trang từ có câu lấy từ bài hát, đã `noindex`) cũng phải chặn ở đây: noindex không ngăn bot tải trang, mà mỗi trang từ dẫn sang hàng chục từ khác nên bot đi mãi
// không hết và ăn gần hết hạn mức Fluid Active CPU của gói Hobby (11 nghìn lượt trong 12 giờ, 2026-11-05).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/learn/", "/library", "/dictionary", "/review", "/settings", "/welcome", "/api/", "/auth/", "/dev/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
