import type { Metadata } from "next";
import { InstallAppGuide } from "@/components/pwa/install-app-guide";

export const metadata: Metadata = { title: "Cài app trên điện thoại", robots: { index: false } };

export default function InstallAppPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-space-md">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Cài SongHanzi lên điện thoại</h1>
        <p className="mt-1 text-body-lg text-on-surface-variant">Không cần tải từ cửa hàng ứng dụng: thêm SongHanzi vào màn hình chính là dùng như một app thật. Làm theo vài bước dưới đây, mất chưa đến một phút.</p>
      </header>
      <InstallAppGuide />
    </div>
  );
}
