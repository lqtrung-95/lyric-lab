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
      {/* Hai hàng hai ô cao bằng nhau: hàng trên là việc cần làm (hành động + nhiệm vụ), hàng dưới là việc mới (dán bài + lộ trình). Điện thoại xếp một cột theo thứ tự đọc. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-space-md lg:grid-cols-2">
        <div className="lg:col-start-1 lg:row-start-1"><NextActionPanel /></div>
        <div className="lg:col-start-2 lg:row-start-1 max-lg:order-3"><HomeQuests /></div>
        <div className="lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="paste-heading" className="card-ink flex h-full flex-col px-space-md py-space-md">
            <h1 id="paste-heading" className="text-headline-md">Học từ bất kỳ bài hát nào</h1>
            <p className="mt-1 max-w-xl text-body-md text-on-surface-variant">Dán link YouTube, xem trước từ vựng và ngữ pháp đáng học, rồi nghe với lời chạy theo nhạc.</p>
            <div className="mt-space-sm">
              <PasteLinkForm />
              <ToolsHint />
            </div>
          </section>
        </div>
        <div className="lg:col-start-2 lg:row-start-2 max-lg:order-4"><HomePathCard /></div>
      </div>
      <div className="mt-space-md"><HomeVersusCard /></div>
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
