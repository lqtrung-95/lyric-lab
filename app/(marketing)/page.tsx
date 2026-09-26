import type { Metadata } from "next";
import { AudienceLevels } from "@/components/landing/audience-levels";
import { BeforeAfter } from "@/components/landing/before-after";
import { FaqSection } from "@/components/landing/faq-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/landing-hero";
import { LiveDemo } from "@/components/landing/live-demo";
import { Reveal } from "@/components/landing/reveal";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { landingJsonLd } from "@/lib/seo/landing-json-ld";

const TITLE = "Lyric Lab: học tiếng Trung qua bài hát, dành cho người Việt";
const DESCRIPTION = "Dán link YouTube, Lyric Lab chọn từ vựng và ngữ pháp đáng học kèm pinyin, âm Hán Việt và nghĩa theo câu hát. Nghe với lời chạy theo nhạc, ôn bằng flashcard FSRS. Miễn phí, chữ giản thể.";

// Trang giới thiệu là trang duy nhất cho công cụ tìm kiếm lập chỉ mục; mọi trang học đều noindex.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "Lyric Lab", title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** Trang giới thiệu (marketing): kể câu chuyện sản phẩm và dẫn người xem vào app. */
export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd(DESCRIPTION)) }} />
      <LandingHero />
      <Reveal><ProblemSolution /></Reveal>
      <Reveal><LiveDemo /></Reveal>
      <Reveal><BeforeAfter /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><FeatureShowcase /></Reveal>
      <Reveal><AudienceLevels /></Reveal>
      <Reveal><FeaturesGrid /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><FinalCta /></Reveal>
    </>
  );
}
