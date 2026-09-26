import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSections } from "@/components/landing/landing-sections";
import { OnboardingBanner } from "@/components/home/onboarding-banner";
import { RecentSongsSection } from "@/components/home/recent-songs-section";
import { TodayReviewCard } from "@/components/home/today-review-card";

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <OnboardingBanner />
      <TodayReviewCard />
      <RecentSongsSection />
      <LandingSections />
    </>
  );
}
