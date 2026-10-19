import type { Metadata } from "next";
import { AnnouncementBanner } from "@/components/chat/announcement-banner";
import { OnboardingBanner } from "@/components/home/onboarding-banner";
import { InstallBanner } from "@/components/pwa/install-banner";
import { PasteLinkForm } from "@/components/home/paste-link-form";
import { RecentSongsSection } from "@/components/home/recent-songs-section";
import { NewcomerSteps } from "@/components/home/newcomer-steps";
import { TodayPlan } from "@/components/home/today-plan";
import { ToolsHint } from "@/components/home/tools-hint";
import { NextActionPanel } from "@/components/home/next-action-panel";
import { HomePathCard } from "@/components/home/home-path-card";
import { HomeQuests } from "@/components/home/home-quests";
import { HomeVersusCard } from "@/components/home/home-versus-card";
import { StreakCard } from "@/components/streak/streak-card";
import { RecommendedSongs } from "@/components/home/recommended-songs";

// Trang làm việc của người dùng: không cần công cụ tìm kiếm lập chỉ mục (trang giới thiệu ở "/").
export const metadata: Metadata = { title: "Trang chủ", robots: { index: false, follow: false } };

/** Trang chủ của app: bên trái dán link bài mới, bên phải bảng "Hôm nay" (một hành động nổi bật + mục tiêu ngày); bên dưới là bài gần đây và gợi ý theo level. */
export default function AppHomePage() {
  return (
    <>
      <AnnouncementBanner />
      <div className="grid gap-space-md lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-space-md">
          <NextActionPanel />
          <section aria-labelledby="paste-heading" className="card-ink relative isolate overflow-hidden px-space-md py-space-lg md:px-space-lg">
            <span aria-hidden="true" lang="zh" className="pointer-events-none absolute -bottom-10 -right-2 -z-10 text-[12rem] font-black leading-none text-primary/[0.06]">歌</span>
            <h1 id="paste-heading" className="text-headline-lg-mobile md:text-headline-lg">Học từ bất kỳ bài hát nào</h1>
            <p className="mt-space-sm max-w-xl text-body-lg text-on-surface-variant">Dán link YouTube, xem trước từ vựng và ngữ pháp đáng học, rồi nghe với lời chạy theo nhạc.</p>
            <div className="mt-space-md">
              <PasteLinkForm />
              <ToolsHint />
            </div>
          </section>
        </div>
        <div className="space-y-space-md">
          <HomeQuests />
          <HomePathCard />
          <HomeVersusCard />
        </div>
      </div>
      <TodayPlan />
      <StreakCard />
      <OnboardingBanner />
      <InstallBanner />
      <NewcomerSteps />
      <RecentSongsSection />
      <RecommendedSongs />
    </>
  );
}
