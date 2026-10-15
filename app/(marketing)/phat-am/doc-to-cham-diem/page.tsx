import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";
import { ReadAloudPractice } from "@/components/pronunciation/read-aloud-practice";

const PATH = "/phat-am/doc-to-cham-diem";
const TITLE = "Đọc to tiếng Trung và chấm điểm từng chữ | SongHanzi";
const DESCRIPTION = "Đọc một câu tiếng Trung vào micro, nhận điểm phát âm cho từng chữ kèm gợi ý sửa bằng tiếng Việt. Miễn phí, không cần đăng ký.";
const FAQ = [
  { q: "Điểm được chấm như thế nào?", a: "Bản ghi được gửi tới dịch vụ chấm phát âm Azure Speech để so với câu mẫu; bạn nhận điểm 0–100 cho từng chữ. Điểm chỉ để tham khảo, không thay thế giáo viên." },
  { q: "Âm thanh của tôi có được lưu lại không?", a: "Không. Bản ghi chỉ được chuyển đi để chấm rồi bỏ, SongHanzi không lưu âm thanh." },
  { q: "Vì sao có chữ báo thiếu?", a: "Hệ thống không nghe thấy chữ đó trong bản ghi. Hãy đọc đủ cả câu, rõ và không quá nhanh." },
  { q: "Mỗi ngày chấm được bao nhiêu lần?", a: "Có hạn mức mỗi ngày để giữ dịch vụ miễn phí. Hết lượt thì quay lại vào hôm sau." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function ReadAloudPage() {
  return (
    <PronunciationPageShell path={PATH} name="Đọc to và chấm điểm từng chữ" description={DESCRIPTION} title="Đọc to và chấm điểm từng chữ" intro="Chọn câu, nghe mẫu, đọc lại vào micro. Chữ nào đọc chưa tốt sẽ được tô màu kèm gợi ý sửa." faq={FAQ}>
      <ReadAloudPractice />
    </PronunciationPageShell>
  );
}
