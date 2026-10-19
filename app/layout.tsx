import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SITE_URL } from "@/lib/seo/site-url";
import { CjkFontLoader } from "@/components/layout/cjk-font-loader";
import { iconFontUrl } from "@/lib/ui/google-fonts-url";
import "./globals.css";

// Font tự host (tải lúc build, phục vụ cùng domain): không phụ thuộc CDN lúc chạy và luôn có bộ glyph tiếng Việt.
// Plus Jakarta Sans cho toàn bộ giao diện và tiêu đề (đủ dấu tiếng Việt, nét tròn đậm hợp phong cách game). Chữ Hán (Noto Sans SC) nạp qua link Google Fonts:
// next/font phải tải hàng trăm mảnh CJK lúc build nên làm hỏng build, còn Google tự cắt theo unicode-range.
// Chỉ nạp đúng các độ đậm đang dùng (400-800) và bộ ký tự latin + vietnamese; mỗi tổ hợp là một file được preload nên thừa là chặn băng thông.
const sans = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700", "800"], style: ["normal"], display: "swap", variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SongHanzi", template: "%s · SongHanzi" },
  description: "Học tiếng Trung qua bài hát và video: xem trước từ vựng, nghe với lời chạy theo nhạc, chép chính tả, luyện nói, ôn bằng flashcard.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fef9ed" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1a12" },
  ],
};

// Áp dụng giao diện tối trước khi vẽ để không bị nháy sáng. Ưu tiên lựa chọn đã lưu, sau đó theo hệ thống.
const THEME_INIT = `try{var t=localStorage.getItem('lyric-lab-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

// Icon (font Material Symbols) ẩn tới khi font tải xong (xem .material-symbols-outlined trong globals.css) — báo
// đúng lúc bằng Font Loading API thay vì chỉ dựa vào mốc dự phòng cố định, mờ dần cho êm thay vì hiện đột ngột.
const ICONS_READY_INIT = `try{document.fonts.ready.then(function(){document.documentElement.classList.add('fonts-ready')})}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: ICONS_READY_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={iconFontUrl()} />
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
        <CjkFontLoader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
