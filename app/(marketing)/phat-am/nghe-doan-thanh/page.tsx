import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";
import { ToneQuizGame } from "@/components/pronunciation/tone-quiz-game";

const PATH = "/phat-am/nghe-doan-thanh";
const TITLE = "Trò nghe đoán thanh điệu tiếng Trung | SongHanzi";
const DESCRIPTION = "Nghe một âm tiết và đoán đó là thanh 1, 2, 3 hay 4. Trò chơi 8 câu giúp luyện tai nghe thanh điệu tiếng Trung. Miễn phí, không cần đăng ký.";
const FAQ = [
  { q: "Chơi trò này có lợi gì?", a: "Phân biệt được thanh bằng tai là bước đầu để phát âm đúng thanh. Người Việt vốn có nhiều thanh nên thường học nhanh nếu được nghe đủ nhiều." },
  { q: "Giọng đọc lấy từ đâu?", a: "Giọng AI tiếng Trung tự nhiên, phát từ máy chủ của SongHanzi hoặc giọng hệ thống nếu không tải được." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function ToneQuizPage() {
  return (
    <PronunciationPageShell path={PATH} name="Trò nghe đoán thanh điệu" description={DESCRIPTION} title="Nghe và đoán thanh điệu" intro="Nghe âm tiết, chọn thanh 1–4. Mỗi lượt 8 câu." faq={FAQ}>
      <ToneQuizGame />
    </PronunciationPageShell>
  );
}
