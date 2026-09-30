import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "link", title: "Dán link hoặc gõ tên bài", body: "Dán link YouTube, hoặc chỉ cần gõ tên bài hát hay nghệ sĩ, Songhanzi tìm giúp bạn. Bài tiếng Phổ thông có lời đồng bộ là dùng được." },
  { icon: "auto_awesome", title: "Xem trước điều đáng học", body: "AI chọn 8–12 từ vựng và vài mẫu ngữ pháp, lọc theo level HSK của bạn. Từ đã biết thì ẩn đi." },
  { icon: "headphones", title: "Nghe cùng lời chạy theo nhạc", body: "Chạm vào từ bất kỳ để xem nghĩa ngay trong câu hát. Lặp một câu, nghe chậm lại, xem pinyin khi cần." },
  { icon: "style", title: "Ôn và luyện mỗi ngày", body: "Từ bạn lưu thành flashcard, FSRS xếp lịch ôn riêng cho từng thẻ. Thêm vài phút chơi gõ pinyin, điền lời, ghép cặp để nhớ chắc hơn." },
];

/** Bốn bước từ dán link tới ôn tập. */
export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="mt-24 scroll-mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Cách hoạt động</p>
      <h2 id="how-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Từ một bài hát yêu thích đến vốn từ của bạn</h2>
      <ol className="mt-space-lg grid gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative rounded-3xl bg-surface-container-lowest p-space-md shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
            <span aria-hidden="true" className="absolute right-5 top-4 font-serif text-[56px] font-semibold leading-none text-primary/10">{i + 1}</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"><Icon name={s.icon} size={26} /></span>
            <h3 className="mt-space-md font-serif text-headline-md text-on-surface"><span className="sr-only">Bước {i + 1}: </span>{s.title}</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
