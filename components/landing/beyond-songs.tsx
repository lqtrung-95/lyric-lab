import Link from "next/link";

const CARDS = [
  {
    emoji: "🧭", title: "Khám phá: học từ bằng cách đi dạo",
    body: "Bước vào quán ăn, bệnh viện, tiệm may, trạm chuyển phát… Chạm đồ vật để nghe và học tên tiếng Trung, làm nhiệm vụ cho nhân vật dẫn đường, phá một vụ án bằng tiếng Trung, rồi đi trọn một hành trình trong ngày qua nhiều cảnh và đóng dấu vào hộ chiếu.",
    chips: ["66 cảnh", "Hành trình trong ngày", "Hộ chiếu", "Phá án"], href: "/explore", cta: "Vào Khám phá", accent: true,
  },
  {
    emoji: "🐾", title: "Bạn nhỏ đồng hành: nuôi pet bằng việc học",
    body: "Nhận nuôi một bạn nhỏ, học đều thì bạn lớn lên, tiến hóa và có phụ kiện mới. Cho ăn bằng thẻ ôn, dạy bạn từ mới, cho bạn đi phiêu lưu mang quà về, trang trí ngôi nhà bằng đồ mở khóa nhờ chuỗi ngày và mục tiêu tuần. Không phạt, không phải trả tiền.",
    chips: ["8 loài", "Phiêu lưu", "Nhà để trang trí", "Mục tiêu tuần"], href: "/app", cta: "Nhận nuôi bạn nhỏ",
  },
  {
    emoji: "📖", title: "Truyện ngắn có cấp độ",
    body: "Hơn 15 truyện ngắn từ HSK 1 đến HSK 5, chia đoạn như bài văn và có tranh minh họa. Bật pinyin, nghe từng đoạn, bấm bất kỳ từ nào để tra nghĩa và lưu thẻ, rồi trả lời câu hỏi đọc hiểu.",
    chips: ["Bấm từ để tra", "Nghe cả bài", "Đọc hiểu"], href: "/readings", cta: "Đọc thử",
  },
  {
    emoji: "💬", title: "Hội thoại: đóng vai một bên",
    body: "Hơn 70 hội thoại hai người theo chủ đề và cấp HSK. Nghe từng câu có pinyin và nghĩa Việt, chọn một vai để tập nói, rồi ghi âm giọng mình và nghe lại cả cuộc trò chuyện.",
    chips: ["Theo cấp HSK", "Đóng vai", "Ghi âm (thử nghiệm)"], href: "/dialogues", cta: "Thử hội thoại",
  },
  {
    emoji: "✍️", title: "Viết chữ và ghép bộ thủ",
    body: "Nghe nghĩa rồi viết từng chữ theo đúng thứ tự nét, được chấm sao và tính vào lịch ôn. Ghép các bộ thủ thành chữ mới (日 + 月 = 明) và xem vì sao ghép được. Có thêm mục Từ khó gom những từ bạn hay quên để luyện riêng.",
    chips: ["Thứ tự nét", "Ghép bộ thủ", "Từ khó"], href: "/review/write", cta: "Tập viết",
  },
  {
    emoji: "🧩", title: "Ngữ pháp: mẫu câu theo cấp HSK",
    body: "63 mẫu thông dụng từ HSK 1 đến HSK 6: công thức, so sánh với tiếng Việt, lỗi hay sai và ví dụ có giọng đọc. Luyện bằng xếp từ, điền chỗ trống, chọn câu đúng; thi cuối mỗi cấp, lưu mẫu vào thẻ ôn, và khi nghe bài hát câu nào dùng mẫu quen thì có nhãn ngay dưới lời.",
    chips: ["63 mẫu", "Bài tập", "Thi cuối cấp", "Nhãn trong lời"], href: "/grammar", cta: "Học ngữ pháp",
  },
  {
    emoji: "⚔️", title: "Thi đấu với bạn bè",
    body: "Tạo phòng, gửi mã cho bạn và đấu gõ pinyin 1–1 xem ai nhanh hơn, hoặc so điểm luyện tập trên bảng xếp hạng. Thắng thua chỉ để vui, không ảnh hưởng lịch ôn của bạn.",
    chips: ["Đấu 1–1", "Phòng mời bạn", "Xếp hạng"], href: "/room", cta: "Vào phòng đấu",
  },
  {
    emoji: "🛠️", title: "Công cụ miễn phí, không cần đăng ký",
    body: "Đổi tên Việt sang tên tiếng Trung kèm thẻ ảnh để khoe, bảng pinyin có hình vị trí đặt lưỡi cho người Việt, kiểm tra ngữ pháp bằng AI, đổi giản thể và phồn thể, giấy tập viết chữ Hán và nhiều công cụ khác.",
    chips: ["Tên tiếng Trung", "Hình đặt lưỡi", "Ngữ pháp AI", "In giấy tập viết"], href: "/tools", cta: "Xem công cụ",
  },
];

/** Khối "Ngoài bài hát": tám tính năng ngoài lõi bài hát (Khám phá, Bạn nhỏ đồng hành, Truyện ngắn, Hội thoại, Viết chữ, Ngữ pháp, Thi đấu, Công cụ), mỗi thẻ có một nút vào thẳng. */
export function BeyondSongs() {
  return (
    <section id="beyond-songs" aria-labelledby="beyond-heading" className="mt-24 scroll-mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Ngoài bài hát</p>
      <h2 id="beyond-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Học tiếp bằng trò chơi, truyện, hội thoại và một người bạn nhỏ đồng hành</h2>
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
