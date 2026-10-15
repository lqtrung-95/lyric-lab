import { PinyinChart } from "@/components/pronunciation/pinyin-chart";
import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";

const PATH = "/phat-am/bang-pinyin";
const TITLE = "Bảng pinyin cho người Việt: nghe và phát âm từng âm | SongHanzi";
const DESCRIPTION = "Bảng phụ âm đầu và vần pinyin có giọng đọc chuẩn, mẹo phát âm so với tiếng Việt và các lỗi người Việt hay mắc. Miễn phí, không cần đăng ký.";
const FAQ = [
  { q: "Bảng pinyin có bao nhiêu âm?", a: "Pinyin gồm khoảng 21 phụ âm đầu và 36 vần; ghép với bốn thanh điệu thành hơn một nghìn âm tiết thông dụng." },
  { q: "Vì sao cần bật hơi khi đọc p, t, k?", a: "Tiếng Trung phân biệt âm bật hơi và không bật hơi (b–p, d–t, g–k). Thiếu luồng hơi thì người nghe sẽ hiểu thành từ khác." },
  { q: "So sánh với tiếng Việt có chính xác không?", a: "Chỉ gần đúng: hai ngôn ngữ không có cùng bộ âm. Mỗi mẹo đều ghi chỗ khác biệt cần chú ý; hãy luôn nghe giọng mẫu để đối chiếu." },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function PinyinChartPage() {
  return (
    <PronunciationPageShell path={PATH} name="Bảng pinyin cho người Việt" description={DESCRIPTION} title="Bảng pinyin cho người Việt" intro="Bấm vào từng ví dụ để nghe giọng đọc chuẩn. Mỗi âm có mẹo phát âm so với tiếng Việt." faq={FAQ}>
      <PinyinChart />
    </PronunciationPageShell>
  );
}
