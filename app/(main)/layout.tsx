import { ChatBubble } from "@/components/chat/chat-bubble";
import { HudBar } from "@/components/layout/hud-bar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SideNav } from "@/components/layout/side-nav";
import { InstallPromptCapture } from "@/components/pwa/install-prompt-capture";

/**
 * Khung các trang chính (Hôm nay, Học, Nghe, Ôn & Nói, Chơi, cài đặt): thanh bên trái từ md (icon từ md, đầy đủ từ lg), thanh trên HUD, tab bar dưới trên điện thoại và bong bóng chat cộng đồng
 * (chỉ hiện ở vài trang, xem `ChatBubble`). Màn tập trung (nghe, xem video) dùng `SiteHeader` riêng.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideNav />
      <HudBar />
      <div className="md:pl-20 lg:pl-64">
        <main id="main" tabIndex={-1} className="mx-auto max-w-page px-gutter pb-28 pt-24 outline-none md:px-6 md:pb-16 lg:px-10">{children}</main>
      </div>
      <MobileTabBar />
      <ChatBubble />
      <InstallPromptCapture />
    </>
  );
}
