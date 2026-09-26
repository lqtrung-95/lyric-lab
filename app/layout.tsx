import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SITE_URL } from "@/lib/seo/site-url";
import { googleFontsUrl } from "@/lib/ui/google-fonts-url";
import "./globals.css";

// Font tự host (tải lúc build, phục vụ cùng domain): không phụ thuộc CDN lúc chạy và luôn có bộ glyph tiếng Việt.
// Lora cho tiêu đề (dấu tiếng Việt vẽ chuẩn), Be Vietnam Pro cho nội dung. Chữ Hán (Noto Serif SC) nạp qua link Google Fonts:
// next/font phải tải hàng trăm mảnh CJK lúc build nên làm hỏng build, còn Google tự cắt theo unicode-range.
const sans = Be_Vietnam_Pro({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["300", "400", "500", "600", "700"], style: ["normal", "italic"], display: "swap", variable: "--font-be-vietnam-pro" });
const serif = Lora({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap", variable: "--font-lora" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    <html lang="vi" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontsUrl()} />
      </head>
      <body className="min-h-dvh">
        {/* Liên kết bỏ qua thanh điều hướng cho người dùng bàn phím và trình đọc màn hình (WCAG 2.4.1). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-3 focus:text-label-md focus:font-semibold focus:text-on-primary"
        >
          Bỏ qua tới nội dung chính
        </a>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
