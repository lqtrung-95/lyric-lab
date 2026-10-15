import { DailyDrillScreen } from "@/components/pronunciation/daily-drill-screen";
import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";

const PATH = "/phat-am/luyen-moi-ngay";
const TITLE = "Bài luyện phát âm tiếng Trung 5 phút mỗi ngày | SongHanzi";
const DESCRIPTION = "Mỗi ngày một bài ngắn: nghe đoán thanh điệu, đọc một câu và một câu 绕口令. Giữ chuỗi ngày luyện phát âm. Miễn phí, không cần đăng ký.";
const FAQ = [
  { q: "Bài tập hằng ngày gồm những gì?", a: "Bốn câu nghe đoán thanh, một câu đọc to chấm điểm và một câu 绕口令. Mỗi ngày nội dung đổi, cả ngày cùng một bài." },
  { q: "Chuỗi ngày được tính thế nào?", a: "Hoàn thành đủ ba bước trong ngày thì tính một ngày. Chuỗi lưu trên thiết bị này, không cần tài khoản." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function DailyDrillPage() {
  return (
    <PronunciationPageShell path={PATH} name="Luyện phát âm 5 phút mỗi ngày" description={DESCRIPTION} title="Luyện phát âm 5 phút mỗi ngày" intro="Ba bước ngắn, đổi mới mỗi ngày. Cần loa và micro." faq={FAQ}>
      <DailyDrillScreen />
    </PronunciationPageShell>
  );
}
