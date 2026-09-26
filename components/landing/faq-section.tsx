import { Icon } from "@/components/ui/icon";

const FAQ = [
  { q: "Lời bài hát lấy từ đâu?", a: "Từ phụ đề YouTube khi có, hoặc kho lời đồng bộ do cộng đồng đóng góp (LRCLIB). AI chỉ phân tích lời đã có, không bao giờ tự viết hay đoán lời bài hát." },
  { q: "Bài nào cũng dùng được không?", a: "Cần bài có lời đồng bộ theo thời gian. Nếu link MV chưa có, hãy thử bản “lyrics video” của cùng bài hát. Cantopop (tiếng Quảng Đông) chưa được hỗ trợ." },
  { q: "Tôi có cần tạo tài khoản không?", a: "Không. Bạn dùng được ngay, dữ liệu học lưu theo trình duyệt. Muốn giữ thẻ ôn khi đổi máy thì đăng nhập Google trong Cài đặt." },
  { q: "Có hiện chữ phồn thể không?", a: "Không. Dù nguồn lời là phồn thể, Lyric Lab luôn hiển thị chữ giản thể." },
  { q: "Lyric Lab có tải hoặc lưu nhạc không?", a: "Không. Video phát trực tiếp từ YouTube bằng trình phát nhúng. Lyric Lab chỉ lưu kết quả phân tích và thẻ học của bạn." },
];

/** Câu hỏi thường gặp (mở/đóng bằng <details>, dùng được bằng bàn phím). */
export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="mt-24">
      <h2 id="faq-heading" className="font-serif text-headline-lg-mobile md:text-headline-xl">Câu hỏi thường gặp</h2>
      <div className="mt-space-lg divide-y divide-outline-variant/50 rounded-3xl bg-surface-container-lowest px-space-md shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
        {FAQ.map((f) => (
          <details key={f.q} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-body-lg font-medium text-on-surface [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="expand_more" size={24} className="shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-space-md text-body-md text-on-surface-variant">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
