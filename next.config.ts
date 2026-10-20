import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Module native (binding .node theo nền tảng): để Node tự nạp thay vì gói vào bundle.
  serverExternalPackages: ["@node-rs/jieba"],
  // Mọi <Image> trong app đều `unoptimized` (thumbnail YouTube, avatar, logo dựng sẵn) nên KHÔNG khai báo remotePatterns: điểm cuối /_next/image của Vercel
  // là công khai, khai báo nguồn từ xa cho phép bất kỳ ai (hoặc bot) xin ảnh i.ytimg.com đã chuyển đổi và đốt hết hạn mức 5.000 lượt biến đổi/tháng của gói miễn phí.
};

export default nextConfig;
