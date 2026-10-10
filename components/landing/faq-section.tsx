import { Icon } from "@/components/ui/icon";

const FAQ = [
  { q: "Lời bài hát lấy từ đâu?", a: "Từ phụ đề YouTube khi có, hoặc kho lời đồng bộ do cộng đồng đóng góp (LRCLIB). AI chỉ phân tích lời đã có, không bao giờ tự viết hay đoán lời bài hát." },
  { q: "Bài nào cũng dùng được không?", a: "Cần bài có lời đồng bộ theo thời gian. Nếu link MV chưa có, hãy thử bản “lyrics video” của cùng bài hát. Cantopop (tiếng Quảng Đông) chưa được hỗ trợ." },
  { q: "SongHanzi có học được qua video tiếng Trung (podcast, vlog) không?", a: "Có. Ngoài bài hát, bạn thêm được video YouTube có phụ đề tiếng Trung. Mỗi video học theo ba cách: phụ đề chạy theo video (bấm từ để tra và lưu thẻ), nghe – chép từng câu, và luyện nói theo mẫu. Bản dịch tiếng Việt do AI làm nên có thể chưa hoàn hảo; bạn báo được bản dịch sai ngay trên từng câu." },
  { q: "AI nghe giọng của tôi có lưu âm thanh không?", a: "SongHanzi không lưu giọng nói của bạn. Chỉ khi bạn tự bấm “Nhờ AI nhận xét”, đoạn ghi âm đó mới được gửi sang dịch vụ AI (Google Gemini) để nghe và nhận xét thanh điệu; không có thao tác nào gửi tự động. Gói miễn phí của dịch vụ này có thể dùng nội dung gửi lên để cải thiện sản phẩm của họ, nên đừng nói thông tin cá nhân. Đây là tính năng thử nghiệm, điểm số chỉ để tham khảo." },
  { q: "Hỏi AI về câu hát có giới hạn không?", a: "Có, mỗi ngày bạn hỏi được một số lượt nhất định để dịch vụ giữ miễn phí cho mọi người; hết lượt thì mai hỏi tiếp. Câu trả lời chỉ xoay quanh câu bạn đang học (nghĩa, ngữ pháp, cách dùng)." },
  { q: "Tôi có cần tạo tài khoản không?", a: "Không. Bạn dùng được ngay, dữ liệu học lưu theo trình duyệt. Muốn giữ thẻ ôn khi đổi máy thì đăng nhập Google trong Cài đặt." },
  { q: "Tôi không nhớ tên bài hát thì sao?", a: "Gõ tên bài hoặc tên nghệ sĩ (tiếng Việt, pinyin hay chữ Hán đều được) vào ô ở đầu trang. SongHanzi gợi ý các bài đã có sẵn và kết quả trên YouTube. Nếu chưa tìm được, bạn vẫn dán link như bình thường." },
  { q: "Ngoài flashcard còn cách ôn nào khác?", a: "Có năm trò chơi ngắn: gõ pinyin, điền lời, ghép cặp, nghe và chọn, karaoke điền lời. Chơi thoải mái, không đồng hồ đếm ngược. Với thẻ đến hạn, kết quả còn được tính vào lịch ôn." },
  { q: "Bảng xếp hạng có lộ thông tin cá nhân không?", a: "Không. Bạn chỉ xuất hiện khi tự bật và chọn một biệt danh, không dùng email hay tên Google. Bảng chỉ hiện biệt danh và điểm, bạn rời bảng bất cứ lúc nào." },
  { q: "Có hiện chữ phồn thể không?", a: "Không. Dù nguồn lời là phồn thể, SongHanzi luôn hiển thị chữ giản thể." },
  { q: "SongHanzi có tải hoặc lưu nhạc không?", a: "Không. Video phát trực tiếp từ YouTube bằng trình phát nhúng. SongHanzi chỉ lưu kết quả phân tích và thẻ học của bạn." },
];

/** Câu hỏi thường gặp (mở/đóng bằng <details>, dùng được bằng bàn phím). */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mt-24 scroll-mt-24">
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
