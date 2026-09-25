import { notFound } from "next/navigation";
import { LearnMobileHeader } from "@/components/layout/learn-mobile-header";
import { SiteHeader } from "@/components/layout/site-header";
import { ListenScreen } from "@/components/listen/listen-screen";
import { yeCheAnalysis, yeCheSong } from "@/lib/preview/fixtures/ye-che-analysis";

// Trang thử màn Nghe với dữ liệu mẫu hư cấu, không gọi DB/AI. Chỉ có ở môi trường phát triển và test.
export const metadata = { robots: { index: false, follow: false } };

export default function ListenFixturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <div className="hidden md:block"><SiteHeader /></div>
      <LearnMobileHeader title="Nghe" />
      <main className="pt-16">
        <ListenScreen analysis={yeCheAnalysis} song={yeCheSong} />
      </main>
    </>
  );
}
