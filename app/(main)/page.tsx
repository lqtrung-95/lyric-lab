import { PasteLinkForm } from "@/components/home/paste-link-form";
import { TodayReviewCard } from "@/components/home/today-review-card";
import { RecentSongsSection } from "@/components/home/recent-songs-section";

export default function HomePage() {
  return (
    <>
      <section className="rounded-3xl bg-surface-container-low px-space-md py-space-xl md:px-space-xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Hôm nay bạn muốn học bài hát nào?</h1>
        <p className="mt-space-sm max-w-2xl text-body-lg text-on-surface-variant">
          Dán link YouTube, xem trước từ vựng và ngữ pháp đáng học, rồi nghe với lời chạy theo nhạc.
        </p>
        <div className="mt-space-lg">
          <PasteLinkForm />
        </div>
      </section>
      <TodayReviewCard />
      <RecentSongsSection />
    </>
  );
}
