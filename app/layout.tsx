import type { Metadata, Viewport } from "next";
import { googleFontsUrl } from "@/lib/ui/google-fonts-url";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Lyric Lab", template: "%s · Lyric Lab" },
  description: "Học tiếng Trung qua bài hát: xem trước từ vựng, nghe với lời chạy theo nhạc, ôn bằng flashcard.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1611" },
  ],
};

// Áp dụng giao diện tối trước khi vẽ để không bị nháy sáng. Ưu tiên lựa chọn đã lưu, sau đó theo hệ thống.
const THEME_INIT = `try{var t=localStorage.getItem('lyric-lab-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontsUrl()} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
