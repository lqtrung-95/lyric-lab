import type { MetadataRoute } from "next";

/**
 * Cho phép cài SongHanzi như một app (PWA). `share_target` đưa app vào danh sách "Chia sẻ" của Android: ở app YouTube bấm Chia sẻ → SongHanzi
 * là mở thẳng bài đó, khỏi dán link. iOS Safari chưa hỗ trợ share target.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SongHanzi",
    short_name: "SongHanzi",
    description: "Học tiếng Trung qua bài hát và video.",
    lang: "vi",
    start_url: "/app",
    display: "standalone",
    background_color: "#fff8f4",
    theme_color: "#fff8f4",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    share_target: { action: "/share-target", method: "GET", params: { title: "title", text: "text", url: "url" } },
  } as MetadataRoute.Manifest;
}
