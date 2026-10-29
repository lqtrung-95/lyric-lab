import type { Metadata } from "next";
import { AudienceLevels } from "@/components/landing/audience-levels";
import { BeforeAfter } from "@/components/landing/before-after";
import { BeyondSongs } from "@/components/landing/beyond-songs";
import { FaqSection } from "@/components/landing/faq-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { GameLoop } from "@/components/landing/game-loop";
import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/landing-hero";
import { LiveDemo } from "@/components/landing/live-demo";
import { Reveal } from "@/components/landing/reveal";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { landingJsonLd } from "@/lib/seo/landing-json-ld";

const TITLE = "SongHanzi: học tiếng Trung qua bài hát và video, dành cho người Việt";
const DESCRIPTION = "Dán link YouTube hoặc gõ tên bài hát, SongHanzi chọn từ vựng và ngữ pháp đáng học kèm pinyin, âm Hán Việt và nghĩa theo câu hát. Học thêm qua video tiếng Trung (podcast, vlog) bằng chép chính tả và luyện nói có AI nhận xét giọng. Học theo lộ trình HSK 1–6 với hơn 700 chặng nhỏ (học từng thẻ, xem đoạn video thật, đọc to chấm điểm, quiz). Ôn bằng flashcard FSRS và trò chơi luyện tập, có XP, huy hiệu và nhiệm vụ mỗi ngày. Học thêm qua Khám phá 66 cảnh đời sống, truyện ngắn có cấp độ, hội thoại đóng vai, tập viết chữ Hán và một bạn nhỏ đồng hành lớn lên cùng bạn. Miễn phí, chữ giản thể.";

// Trang giới thiệu là trang duy nhất cho công cụ tìm kiếm lập chỉ mục; mọi trang học đều noindex.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title: TITLE, description: DESCRIPTION, url: "/" },
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
      <Reveal><GameLoop /></Reveal>
      <Reveal><FeatureShowcase /></Reveal>
      <Reveal><BeyondSongs /></Reveal>
      <Reveal><AudienceLevels /></Reveal>
      <Reveal><FeaturesGrid /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><FinalCta /></Reveal>
    </>
  );
}
