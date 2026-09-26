import type { Metadata } from "next";
import { OnboardingBanner } from "@/components/home/onboarding-banner";
import { PasteLinkForm } from "@/components/home/paste-link-form";
import { RecentSongsSection } from "@/components/home/recent-songs-section";
import { TodayPanel } from "@/components/home/today-panel";

// Trang làm việc của người dùng: không cần công cụ tìm kiếm lập chỉ mục (trang giới thiệu ở "/").
export const metadata: Metadata = { title: "Trang chủ", robots: { index: false, follow: false } };

/** Trang chủ của app: bên trái dán link bài mới, bên phải bảng "Hôm nay"; bên dưới là bài học gần đây. */
export default function AppHomePage() {
  return (
    <>
      <div className="grid gap-space-md lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="relative isolate overflow-hidden rounded-3xl bg-surface-container-low px-space-md py-space-xl md:px-space-xl">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_95%_0%,color-mix(in_srgb,var(--primary-container)_18%,transparent),transparent)]" />
          <span aria-hidden="true" lang="zh" className="pointer-events-none absolute -bottom-12 -right-2 -z-10 font-serif text-[15rem] leading-none text-primary/[0.05]">歌</span>
          <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Hôm nay bạn muốn học bài hát nào?</h1>
          <p className="mt-space-sm max-w-xl text-body-lg text-on-surface-variant">
            Dán link YouTube, xem trước từ vựng và ngữ pháp đáng học, rồi nghe với lời chạy theo nhạc.
          </p>
          <div className="mt-space-lg">
            <PasteLinkForm />
          </div>
        </section>
        <TodayPanel />
      </div>
      <OnboardingBanner />
      <RecentSongsSection />
    </>
  );
}
