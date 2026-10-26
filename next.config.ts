import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/routes/legacy-redirects";

const nextConfig: NextConfig = {
  // Đường dẫn tiếng Việt cũ → tiếng Anh mới.
  redirects: async () => legacyRedirects(),
  // Module native (binding .node theo nền tảng): để Node tự nạp thay vì gói vào bundle.
  serverExternalPackages: ["@node-rs/jieba"],
  // Route nét viết đọc file JSON từng chữ trong gói dữ liệu bằng đường dẫn tính lúc chạy nên bộ dò phụ thuộc của Next không tự thấy: khai báo để bản deploy kèm theo. Khóa dùng `**` chứ không dùng `[char]`: khóa là mẫu glob (picomatch) nên `[char]` bị hiểu là tập ký tự và không khớp tuyến.
  outputFileTracingIncludes: { "/api/dictionary/strokes/**": ["./node_modules/hanzi-writer-data/*.json"] },
  // Mọi <Image> trong app đều `unoptimized` (thumbnail YouTube, avatar, logo dựng sẵn) nên KHÔNG khai báo remotePatterns: điểm cuối /_next/image của Vercel
  // là công khai, khai báo nguồn từ xa cho phép bất kỳ ai (hoặc bot) xin ảnh i.ytimg.com đã chuyển đổi và đốt hết hạn mức 5.000 lượt biến đổi/tháng của gói miễn phí.
};

export default nextConfig;
