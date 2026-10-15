import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";
import { TwisterChallenge } from "@/components/pronunciation/twister-challenge";

const PATH = "/phat-am/rao-khau-lenh";
const TITLE = "Thử thách 绕口令 tiếng Trung: đọc nhanh, chấm điểm | SongHanzi";
const DESCRIPTION = "Câu thách đọc nhanh 绕口令 tiếng Trung có chấm điểm từng chữ và thẻ chia sẻ điểm. Luyện các cặp âm người Việt hay lẫn. Miễn phí.";
const FAQ = [
  { q: "绕口令 là gì?", a: "Là câu dân gian khó đọc nhanh vì dồn nhiều âm gần giống nhau, như tiếng Việt có câu \"lúa nếp là lúa nếp\". Rất hợp để luyện phát âm." },
  { q: "Nên đọc thế nào để được điểm cao?", a: "Đọc chậm, rõ từng âm trước; chỉ tăng tốc khi đã trơn. Đọc nhanh mà sai âm sẽ bị trừ điểm." },
  { q: "Điểm cao nhất của tôi lưu ở đâu?", a: "Trên thiết bị này. Bạn có thể bấm Chia sẻ điểm để lưu ảnh hoặc gửi cho bạn bè." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function TwisterPage() {
  return (
    <PronunciationPageShell path={PATH} name="Thử thách 绕口令" description={DESCRIPTION} title="Thử thách 绕口令" intro="Chọn một câu, đọc thật rõ và thật trơn, rồi khoe điểm với bạn bè." faq={FAQ}>
      <TwisterChallenge />
    </PronunciationPageShell>
  );
}
