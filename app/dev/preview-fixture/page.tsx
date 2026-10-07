import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { PreviewScreen } from "@/components/preview/preview-screen";
import { yeCheAnalysis, yeCheSong } from "@/lib/preview/fixtures/ye-che-analysis";
import { collectWordStats } from "@/lib/preview/word-stats";
import { SeedFixtureLevel } from "./seed-level";

// Trang thử giao diện với dữ liệu mẫu hư cấu, không gọi DB/AI. Chỉ có ở môi trường phát triển và test.
export const metadata = { robots: { index: false, follow: false } };

// Cấp HSK của từ mẫu lấy từ chính các mục từ vựng của dữ liệu mẫu (không tra DB); từ không có mục thì ngoài HSK.
const levelByTerm = new Map(yeCheAnalysis.items.map((i) => [i.term, i.level]));
const wordStats = collectWordStats(yeCheAnalysis.lines, (term) => levelByTerm.get(term) ?? null);

export default function PreviewFixturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Xem trước" />
      <main id="main" tabIndex={-1} className="pt-16 outline-none">
        <SeedFixtureLevel />
        <PreviewScreen analysis={yeCheAnalysis} song={yeCheSong} wordStats={wordStats} />
      </main>
    </>
  );
}
