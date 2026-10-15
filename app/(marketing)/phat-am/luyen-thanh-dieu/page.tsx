import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";
import { ToneRulesList } from "@/components/pronunciation/tone-rules-list";
import { ToneTrainer } from "@/components/pronunciation/tone-trainer";

const PATH = "/phat-am/luyen-thanh-dieu";
const TITLE = "Luyện thanh điệu tiếng Trung có chấm cao độ giọng | SongHanzi";
const DESCRIPTION = "Nghe mẫu, ghi âm và xem đường cao độ giọng bạn so với bốn thanh tiếng Trung ngay trên điện thoại. Miễn phí, âm thanh được phân tích trên máy bạn.";
const FAQ = [
  { q: "Âm thanh của tôi có bị gửi đi đâu không?", a: "Không. Việc dò cao độ chạy hoàn toàn trên trình duyệt của bạn, bản ghi không được tải lên máy chủ." },
  { q: "Độ chính xác của phần chấm thanh điệu thế nào?", a: "Công cụ so hình dạng đường cao độ với thanh mẫu nên nhận ra khá tốt khi đọc từng âm tiết riêng, nhưng không thay được người nghe thật. Môi trường ồn hoặc đọc quá nhỏ có thể cho kết quả sai." },
  { q: "Tại sao thanh 3 hay bị nhận nhầm?", a: "Trong lời nói liền, thanh 3 thường chỉ xuống thấp mà không lên lại. Bài luyện này yêu cầu đọc thanh 3 đầy đủ: xuống rồi lên." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function ToneTrainerPage() {
  return (
    <PronunciationPageShell path={PATH} name="Luyện thanh điệu tiếng Trung" description={DESCRIPTION} title="Luyện thanh điệu tiếng Trung" intro="Nghe mẫu, đọc lại vào micro và xem đường cao độ giọng bạn khớp thanh nào." faq={FAQ}>
      <ToneTrainer />
      <section aria-labelledby="rules-heading" className="space-y-space-sm">
        <h2 id="rules-heading" className="font-serif text-headline-md">Bốn thanh điệu</h2>
        <ToneRulesList />
      </section>
    </PronunciationPageShell>
  );
}
