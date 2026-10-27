import { ScriptConverter } from "@/components/tools/script-converter";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/gian-the-phon-the";
const TITLE = "Chuyển giản thể sang phồn thể và ngược lại (miễn phí) | SongHanzi";
const DESCRIPTION = "Dán chữ Hán để chuyển giản thể ⇄ phồn thể (chuẩn, Đài Loan, Hồng Kông), có đánh dấu những chữ cần đọc lại. Miễn phí, không cần đăng ký.";

const FAQ: ToolFaq[] = [
  { q: "Chuyển giản thể sang phồn thể có chính xác tuyệt đối không?", a: "Hầu hết chữ chuyển đúng, nhưng có chữ giản thể ứng với nhiều chữ phồn thể (như 发 là 發 hay 髮). Công cụ đánh dấu các chữ đó để bạn đọc lại theo nghĩa trong câu." },
  { q: "Phồn thể Đài Loan khác phồn thể thường chỗ nào?", a: "Chế độ Đài Loan đổi cả từ vựng hay dùng ở Đài Loan, ví dụ 软件 thành 軟體 (phồn thể thường chỉ đổi chữ: 軟件)." },
  { q: "Tôi muốn học chữ phồn thể thì nên làm gì?", a: "Gõ hoặc dán câu giản thể bạn đã quen, chuyển sang phồn thể rồi so sánh từng chữ. Bạn cũng có thể dùng Chữ Hán sang pinyin để nghe và học cách đọc." },
  { q: "Văn bản của tôi có được lưu lại không?", a: "Không. Công cụ miễn phí, không cần đăng ký và không lưu văn bản bạn nhập." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): chuyển giản thể ⇄ phồn thể. */
export default function ScriptConverterPage() {
  return (
    <ToolPage href={HREF} name="Chuyển giản thể và phồn thể" description={DESCRIPTION} h1="Chuyển giản thể sang phồn thể và ngược lại" intro="Dán chữ Hán, chọn chiều chuyển, nhận kết quả sao chép được và danh sách chữ cần đọc lại." faq={FAQ}>
      <ScriptConverter />
    </ToolPage>
  );
}
