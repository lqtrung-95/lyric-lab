import type { Metadata } from "next";
import { OnboardingBanner } from "@/components/home/onboarding-banner";
import { PasteLinkForm } from "@/components/home/paste-link-form";
import { RecentSongsSection } from "@/components/home/recent-songs-section";
import { TodayReviewCard } from "@/components/home/today-review-card";

// Trang làm việc của người dùng: không cần công cụ tìm kiếm lập chỉ mục (trang giới thiệu ở "/").
export const metadata: Metadata = { title: "Trang chủ", robots: { index: false, follow: false } };

/** Trang chủ của app: dán link bài hát mới, thẻ cần ôn hôm nay và bài học gần đây. */
export default function AppHomePage() {
  return (
    <>
      <section className="rounded-3xl bg-surface-container-low px-space-md py-space-xl md:px-space-xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Hôm nay bạn muốn học bài hát nào?</h1>
        <p className="mt-space-sm max-w-2xl text-body-lg text-on-surface-variant">
          Dán link YouTube, xem trước từ vựng và ngữ pháp đáng học, rồi nghe với lời chạy theo nhạc.
        </p>
        <div className="mt-space-lg max-w-3xl">
          <PasteLinkForm />
        </div>
      </section>
      <OnboardingBanner />
      <TodayReviewCard />
      <RecentSongsSection />
    </>
  );
}
