import { LearningPathList } from "@/components/pronunciation/learning-path-list";
import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";

const PATH = "/phat-am/lo-trinh";
const TITLE = "Lộ trình học phát âm tiếng Trung cho người Việt | SongHanzi";
const DESCRIPTION = "Lộ trình 6 bước học phát âm tiếng Trung từ phụ âm, vần, thanh điệu đến đọc cả câu và 绕口令. Miễn phí, tiến độ lưu trên thiết bị của bạn.";
const FAQ = [
  { q: "Nên bắt đầu học phát âm từ đâu?", a: "Từ phụ âm đầu và vần trong bảng pinyin, sau đó luyện thanh điệu, rồi mới đọc cả câu. Đừng bỏ qua thanh điệu vì nó quyết định nghĩa của từ." },
  { q: "Tiến độ của tôi được lưu ở đâu?", a: "Trên chính thiết bị này (bộ nhớ trình duyệt), không cần tài khoản. Xóa dữ liệu trình duyệt hoặc đổi máy thì tiến độ sẽ mất." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function LearningPathPage() {
  return (
    <PronunciationPageShell path={PATH} name="Lộ trình học phát âm tiếng Trung" description={DESCRIPTION} title="Lộ trình học phát âm" intro="Sáu bước từ cơ bản đến đọc trơn cả câu. Làm xong bước nào thì đánh dấu lại." faq={FAQ}>
      <LearningPathList />
    </PronunciationPageShell>
  );
}
