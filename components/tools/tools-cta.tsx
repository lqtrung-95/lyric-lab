import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Lời mời vào app ở cuối trung tâm công cụ: người dùng công cụ thường mới quen công cụ, chưa biết có học qua bài hát, luyện nói và Khám phá. */
export function ToolsCta() {
  return (
    <section aria-labelledby="cta-heading" className="rounded-3xl border-2 border-primary/40 bg-primary-container/30 p-space-md md:flex md:items-center md:justify-between md:gap-space-md">
      <div className="space-y-1">
        <h2 id="cta-heading" className="flex items-center gap-2 font-serif text-headline-md"><Icon name="auto_awesome" size={24} />Muốn nói được, không chỉ biết quy tắc?</h2>
        <p className="text-body-md text-on-surface-variant">Học tiếng Trung qua bài hát và video, ôn bằng thẻ nhớ, luyện đọc to có chấm điểm và phá án trong Khám phá. Miễn phí, bắt đầu ngay không cần đăng ký.</p>
      </div>
      <Link href="/app" className="mt-space-sm inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 md:mt-0">Học thử miễn phí</Link>
    </section>
  );
}
