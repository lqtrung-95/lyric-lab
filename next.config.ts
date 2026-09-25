import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Module native (binding .node theo nền tảng): để Node tự nạp thay vì gói vào bundle.
  serverExternalPackages: ["@node-rs/jieba"],
  images: {
    // Thumbnail video YouTube (ảnh bìa bài hát).
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
