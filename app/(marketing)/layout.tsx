import { MarketingFooter } from "@/components/landing/marketing-footer";
import { MarketingHeader } from "@/components/landing/marketing-header";

/** Khung của trang giới thiệu: thanh trên riêng (neo trong trang + nút vào app) và chân trang. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-gutter pt-24 outline-none md:px-6 lg:px-12">
        <span id="top" />
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}
