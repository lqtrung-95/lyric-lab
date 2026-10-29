import Link from "next/link";

const CARDS = [
  {
    emoji: "🧭", title: "Khám phá: học từ bằng cách đi dạo",
    body: "Bước vào quán ăn, bệnh viện, tiệm may, công ty phần mềm… Chạm đồ vật để nghe và học tên tiếng Trung, làm nhiệm vụ cho nhân vật dẫn đường, đọc truyện ngắn hoặc phá một vụ án bằng tiếng Trung.",
    chips: ["60 cảnh", "Phá án", "Nhiệm vụ nghe lệnh"], href: "/explore", cta: "Vào Khám phá", accent: true,
  },
  {
    emoji: "💬", title: "Hội thoại: đóng vai một bên",
    body: "Hơn 60 hội thoại hai người theo chủ đề và cấp HSK. Nghe từng câu có pinyin và nghĩa Việt, chọn một vai để tập nói, rồi ghi âm giọng mình và nghe lại cả cuộc trò chuyện.",
    chips: ["Theo cấp HSK", "Đóng vai", "Ghi âm (thử nghiệm)"], href: "/dialogues", cta: "Thử hội thoại",
  },
  {
    emoji: "🛠️", title: "Công cụ miễn phí, không cần đăng ký",
    body: "Bảng pinyin có hình vị trí đặt lưỡi cho người Việt, kiểm tra ngữ pháp bằng AI, đổi giản thể và phồn thể, giấy tập viết chữ Hán và nhiều công cụ khác.",
    chips: ["Hình đặt lưỡi", "Ngữ pháp AI", "In giấy tập viết"], href: "/tools", cta: "Xem công cụ",
  },
];

/** Khối "Ngoài bài hát": ba tính năng ngoài lõi bài hát (Khám phá, Hội thoại, Công cụ), mỗi thẻ có một nút vào thẳng. */
export function BeyondSongs() {
  return (
    <section id="beyond-songs" aria-labelledby="beyond-heading" className="mt-24 scroll-mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Ngoài bài hát</p>
      <h2 id="beyond-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Học tiếp bằng trò chơi, hội thoại và công cụ miễn phí</h2>
      <ul className="mt-space-lg grid gap-space-md lg:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.title} className={`card-ink flex flex-col p-space-md ${c.accent ? "!bg-secondary-container text-on-secondary-container" : ""}`}>
            <span aria-hidden="true" className="text-4xl">{c.emoji}</span>
            <h3 className="mt-space-sm font-serif text-headline-md text-on-surface">{c.title}</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">{c.body}</p>
            <ul className="mt-space-sm flex flex-wrap gap-1.5">
              {c.chips.map((chip) => <li key={chip} className="rounded-full border-2 border-ink bg-surface-container-lowest px-3 py-1 text-label-md font-bold text-on-surface">{chip}</li>)}
            </ul>
            <div className="mt-auto pt-space-md"><Link href={c.href} className="btn-3d btn-3d-neutral inline-flex">{c.cta}</Link></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
