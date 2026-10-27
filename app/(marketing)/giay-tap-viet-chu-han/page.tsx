import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { WritingPaper } from "@/components/tools/writing-paper";

const HREF = "/giay-tap-viet-chu-han";
const TITLE = "Giấy tập viết chữ Hán 田字格 in miễn phí | SongHanzi";
const DESCRIPTION = "In giấy tập viết chữ Hán miễn phí: ô 田字格, 米字格, ô vuông trơn và giấy pinyin bốn dòng. Chọn cỡ ô, lề, màu rồi in hoặc lưu PDF khổ A4.";

const FAQ: ToolFaq[] = [
  { q: "田字格 và 米字格 khác nhau thế nào?", a: "田字格 (điền tự cách) là ô vuông chia bốn phần bằng chữ thập, dùng phổ biến nhất khi tập viết. 米字格 (mễ tự cách) thêm hai đường chéo, hợp để căn chữ có nhiều nét xiên." },
  { q: "Cỡ ô bao nhiêu là hợp?", a: "Người mới nên chọn 20–25 mm để viết thoải mái và nhìn rõ nét. Khi đã quen, giảm xuống 12–15 mm để có nhiều hàng hơn trên một trang." },
  { q: "Làm sao để lưu thành PDF?", a: "Bấm In hoặc lưu PDF, trong hộp thoại in của trình duyệt chọn máy in là Lưu thành PDF (Save as PDF). Giấy được dựng đúng khổ A4, không lề trang." },
  { q: "Tôi có thể in nhiều bản cho lớp không?", a: "Được. Công cụ miễn phí, bạn in bao nhiêu bản tùy ý để dùng trong lớp hoặc ở nhà." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): giấy tập viết chữ Hán in được. */
export default function WritingPaperPage() {
  return (
    <ToolPage href={HREF} name="Giấy tập viết chữ Hán" description={DESCRIPTION} h1="Giấy tập viết chữ Hán in miễn phí" intro="Chọn kiểu ô, cỡ ô, lề và màu đường kẻ, xem trước rồi in hoặc lưu PDF khổ A4." faq={FAQ}>
      <WritingPaper />
    </ToolPage>
  );
}
