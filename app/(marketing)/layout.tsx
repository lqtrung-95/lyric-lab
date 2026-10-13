import { MarketingFooter } from "@/components/landing/marketing-footer";
import { MarketingHeader } from "@/components/landing/marketing-header";

/** Khung của trang giới thiệu: thanh trên riêng (neo trong trang + nút vào app) và chân trang. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    // Cột dọc cao tối thiểu bằng màn hình: trang ngắn (như mục lục Công cụ) vẫn đẩy chân trang xuống đáy thay vì để nó lơ lửng giữa trang.
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page flex-1 px-gutter pt-24 outline-none md:px-6 lg:px-12">
        <span id="top" />
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
