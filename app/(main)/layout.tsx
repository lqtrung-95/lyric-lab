import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SiteHeader } from "@/components/layout/site-header";

/** Khung các trang chính (trang chủ, ôn tập, thư viện): thanh trên + tab bar mobile. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-gutter pb-28 pt-24 md:px-6 md:pb-16 lg:px-12">{children}</main>
      <MobileTabBar />
    </>
  );
}
