import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { VocabWorksheetGenerator } from "@/components/tools/vocab-worksheet-generator";

const HREF = "/bai-tap-tu-vung-tieng-trung";
const TITLE = "Tạo bài tập từ vựng tiếng Trung có đáp án (in miễn phí) | SongHanzi";
const DESCRIPTION = "Dán danh sách từ tiếng Trung, nhận ngay tờ bài tập A4: nối chữ với pinyin hoặc nghĩa, viết pinyin, viết chữ Hán vào ô, kèm trang đáp án. In hoặc lưu PDF miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Tờ bài tập gồm những phần nào?", a: "Bạn chọn bốn phần: nối chữ Hán với pinyin, nối chữ Hán với nghĩa, viết pinyin cho từng từ, và nhìn pinyin để viết chữ Hán vào các ô. Có thêm trang đáp án (tắt được)." },
  { q: "Tôi không có sẵn danh sách từ thì sao?", a: "Chọn cấp HSK 1 đến 6 và số từ, bấm “Lấy từ và tạo bài”: công cụ lấy ngẫu nhiên các từ của cấp đó (kèm nghĩa tiếng Anh) rồi tạo luôn tờ bài tập. Bấm lại để có bộ từ khác." },
  { q: "Tôi có thể dùng từ đã lưu trong app không?", a: "Có. Bấm “Từ đã lưu của tôi” (cần có tài khoản và đã lưu từ khi xem trước bài hát): công cụ lấy ngẫu nhiên các từ vựng ngắn bạn đã lưu, kèm nghĩa bạn đã lưu, rồi tạo luôn tờ bài tập." },
  { q: "Tôi nhập từ như thế nào?", a: "Mỗi dòng một từ chữ Hán. Muốn có bài nối với nghĩa thì ghi nghĩa tiếng Việt sau dấu phẩy, ví dụ “你好, xin chào”. Tối đa 20 từ mỗi tờ; từ trùng bị bỏ." },
  { q: "Pinyin và âm Hán Việt lấy từ đâu?", a: "Từ từ điển của SongHanzi, không do AI đoán. Từ có nhiều cách đọc được chọn cách đọc thông dụng nhất, nên hãy xem lại trang đáp án trước khi phát cho học sinh." },
  { q: "Làm sao để lưu thành PDF?", a: "Bấm In hoặc lưu PDF, trong hộp thoại in chọn máy in là Lưu thành PDF. Tờ bài tập được dựng đúng khổ A4, trang đáp án nằm ở tờ riêng." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): tạo tờ bài tập từ vựng có đáp án. */
export default function VocabWorksheetPage() {
  return (
    <ToolPage href={HREF} name="Bài tập từ vựng tiếng Trung" description={DESCRIPTION} h1="Tạo bài tập từ vựng tiếng Trung" intro="Dán danh sách từ (có thể kèm nghĩa), chọn các phần bài tập rồi in hoặc lưu PDF." faq={FAQ} wide>
      <VocabWorksheetGenerator />
    </ToolPage>
  );
}
